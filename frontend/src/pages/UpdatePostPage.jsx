import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Oval } from 'react-loader-spinner';

const ItemType = 'IMAGE_ITEM';

const UpdatePostPage = () => {
    const { categorySlug, postId } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm();
    const [allImages, setAllImages] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [titleLength, setTitleLength] = useState(0);
    const [bodyTextLength, setBodyTextLength] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPost, setIsLoadingPost] = useState(true);
    const [postError, setPostError] = useState(null);

    const nextFileNumber = useRef(0);

    const watchedBody = watch('body', '');

    useEffect(() => {
        const div = document.createElement('div');
        div.innerHTML = watchedBody || '';
        setBodyTextLength(div.textContent.length);
    }, [watchedBody]);

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoadingPost(true);
            setPostError(null);
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/posts/${postId}`);
                const postData = res.data;

                setValue('categorySlug', postData.category.slug);
                setValue('title', postData.title);
                setValue('body', postData.body);
                setValue('type', postData.type);

                setAllImages(postData.images.map(img => ({ ...img, isExisting: true })));

                setTitleLength(postData.title.length);
                const div = document.createElement('div');
                div.innerHTML = postData.body || '';
                setBodyTextLength(div.textContent.length);

            } catch (err) {
                console.error('Failed to fetch post:', err);
                setPostError('Failed to load post for editing.');
                toast.error('Failed to load post for editing.');
            } finally {
                setIsLoadingPost(false);
            }
        };

        if (postId) {
            fetchPost();
        }

    }, [postId, setValue]);

    const onDrop = useCallback((acceptedFiles) => {
        const filesWithMetadata = acceptedFiles.map(file => {
            const sequentialName = `file${nextFileNumber.current++}`;
            return Object.assign(file, {
                sequentialName: sequentialName,
                isExisting: false
            });
        });
        setAllImages((prev) => [...prev, ...filesWithMetadata]);
    }, [nextFileNumber]);

    const removeImage = (index) => {
        setAllImages((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    const handleImageReorder = (draggedIndex, targetIndex) => {
        if (draggedIndex === targetIndex) return;

        setAllImages(prev => {
            const newAllImages = [...prev];
            const [movedImage] = newAllImages.splice(draggedIndex, 1);
            newAllImages.splice(targetIndex, 0, movedImage);
            return newAllImages;
        });
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const formData = new FormData();

        const imageOrder = allImages.map(item => item.isExisting ? item.url : item.sequentialName);

        const postUpdateData = {
            categorySlug: data.categorySlug,
            title: data.title,
            body: data.body,
            type: 'DISCUSSION',
            imageOrder: imageOrder,
        };

        formData.append('data', new Blob([JSON.stringify(postUpdateData)], { type: 'application/json' }));

        allImages.forEach(item => {
            if (item instanceof File && !item.isExisting) {
                const renamedFile = new File([item], item.sequentialName, { type: item.type });
                formData.append('newImages', renamedFile);
            }
        });

        try {
            const response = await axios.put(`http://localhost:8080/api/v1/posts/${postId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });

            const updatedPostId = response.data?.id;
            toast.success('Post updated successfully!');
            navigate(`/categories/${categorySlug}/posts/${updatedPostId}`);
        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail || 'Failed to update post';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closePreview = () => {
        setPreviewIndex(null);
    };

    const handleEscClose = (e) => {
        if (e.key === 'Escape') {
            closePreview();
        }
    };

    useEffect(() => {
        if (previewIndex !== null) {
            window.addEventListener('keydown', handleEscClose);
        } else {
            window.removeEventListener('keydown', handleEscClose);
        }

        return () => {
            window.removeEventListener('keydown', handleEscClose);
        };
    }, [previewIndex]);


    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image'
    ];

    const previewImageUrl = previewIndex !== null && allImages[previewIndex]
        ? (allImages[previewIndex].isExisting ? allImages[previewIndex].url : URL.createObjectURL(allImages[previewIndex]))
        : null;


    if (isLoadingPost) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light-gray">
                <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
            </div>
        );
    }

    if (postError) {
        return (
            <div className="text-red-600 text-center mt-8">
                <p>{postError}</p>
            </div>
        );
    }


    return (
        <DndProvider backend={HTML5Backend}>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4 space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-center">Update Post</h2>

                <input type="hidden" value={categorySlug} {...register('categorySlug')} />

                <div>
                    <label htmlFor="title-input" className="block">Title</label>
                    <input
                        type="text"
                        id="title-input"
                        className="border rounded w-full p-2"
                        placeholder="Post title"
                        {...register('title', { required: 'Title is required', minLength: 10, maxLength: 300 })}
                        onChange={(e) => setTitleLength(e.target.value.length)}
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    <CharacterCount min={10} max={300} current={titleLength} />
                </div>

                <div>
                    <label className="block">Body</label>
                    <Controller
                        name="body"
                        control={control}
                        rules={{
                            required: 'Body is required',
                            validate: value => {
                                const div = document.createElement('div');
                                div.innerHTML = value;
                                const textLength = div.textContent.length;
                                if (textLength < 10) return 'Body must be at least 10 characters long';
                                if (textLength > 5000) return 'Body must be no more than 5000 characters long';
                                return true;
                            }
                        }}
                        render={({ field }) => (
                            <ReactQuill
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                modules={modules}
                                formats={formats}
                                placeholder="Write your post content here..."
                            />
                        )}
                    />
                    {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
                    <CharacterCount min={10} max={5000} current={bodyTextLength} />
                </div>

                <div className="space-y-2">
                    <label className="block">Images</label>
                    {(allImages.length === 0) && (
                        <div
                            {...getRootProps()}
                            className={`border-dashed border-2 p-6 rounded text-center cursor-pointer ${
                                isDragActive ? 'bg-indigo-100' : 'bg-gray-50'
                            }`}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the images here...</p>
                            ) : (
                                <p>Drag & drop images here, or click to select files</p>
                            )}
                        </div>
                    )}

                    {allImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 border p-2 rounded">
                            {allImages.map((item, index) => (
                                <DraggableImage
                                    key={item.isExisting ? item.url : item.sequentialName}
                                    index={index}
                                    item={item}
                                    moveImage={handleImageReorder}
                                    removeImage={removeImage}
                                    onClick={() => setPreviewIndex(index)}
                                />
                            ))}
                            {allImages.length < 10 && (
                                <div
                                    {...getRootProps()}
                                    className="border border-dashed rounded flex items-center justify-center cursor-pointer h-24 bg-gray-50 hover:bg-gray-100"
                                >
                                    <input {...getInputProps()} />
                                    <span className="text-gray-500 text-sm">+ Add</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Update Post
                    </button>
                </div>
            </form>

            {previewIndex !== null && allImages[previewIndex] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={closePreview}
                >
                    {previewImageUrl && (
                        <div
                            className="absolute inset-0 bg-cover bg-center filter blur-xl transform scale-125"
                            style={{ backgroundImage: `url(${previewImageUrl})` }}
                            onClick={closePreview}
                        ></div>
                    )}
                    {previewImageUrl && (
                        <div
                            className="absolute inset-0 bg-black opacity-40"
                            onClick={closePreview}
                        ></div>
                    )}

                    {previewImageUrl && (
                        <img
                            src={previewImageUrl}
                            alt="Image Preview"
                            className="max-w-[90%] max-h-[90%] object-contain relative z-10 cursor-pointer"
                            onClick={closePreview}
                        />
                    )}

                    <button
                        className="absolute top-4 right-4 text-white z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
                        onClick={closePreview}
                        aria-label="Close Image Preview"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </DndProvider>
    );
};

const DraggableImage = ({ item, index, moveImage, removeImage, onClick }) => {
    const [, dragRef] = useDrag({
        type: ItemType,
        item: { index },
    });

    const [, dropRef] = useDrop({
        accept: ItemType,
        drop: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveImage(draggedItem.index, index);
            }
        },
    });

    const displayUrl = item.isExisting ? item.url : (item.sequentialName ? URL.createObjectURL(item) : '');

    return (
        <div
            ref={(node) => dragRef(dropRef(node))}
            className="relative border rounded overflow-hidden group cursor-pointer"
            onClick={onClick}
        >
            {displayUrl && (
                <img
                    src={displayUrl}
                    alt={`preview-${index}`}
                    className="w-full h-24 object-cover"
                />
            )}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
                ×
            </button>
        </div>
    );
};

const CharacterCount = ({ min, max, current }) => {
    return (
        <div className="text-sm text-gray-500 text-right">
            <span>{current}/{max}</span> {current < min ? `(Minimum ${min} required)` : ""}
        </div>
    );
};

export default UpdatePostPage;