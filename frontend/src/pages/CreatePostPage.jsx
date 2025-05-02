import React, { useState, useEffect } from 'react';
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

const ItemType = 'IMAGE_ITEM';

const CreatePostPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm();
    const [images, setImages] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [titleLength, setTitleLength] = useState(0);
    const [bodyTextLength, setBodyTextLength] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedBody = watch('body', '');

    useEffect(() => {
        const div = document.createElement('div');
        div.innerHTML = watchedBody || '';
        setBodyTextLength(div.textContent.length);
    }, [watchedBody]);

    const onDrop = (acceptedFiles) => {
        setImages((prev) => [...prev, ...acceptedFiles]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    const handleImageReorder = (draggedIndex, targetIndex) => {
        if (draggedIndex === targetIndex) return;
        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(draggedIndex, 1);
        updatedImages.splice(targetIndex, 0, movedImage);
        setImages(updatedImages);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const formData = new FormData();
        const json = JSON.stringify({
            categorySlug: data.categorySlug,
            title: data.title,
            body: data.body,
            type: data.type,
        });

        formData.append('data', new Blob([json], { type: 'application/json' }));
        images.forEach((file) => formData.append('images', file));

        try {
            const response = await axios.post('http://localhost:8080/api/v1/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });

            const postId = response.data?.id;
            toast.success('Post created successfully!');
            reset({ categorySlug: data.categorySlug, title: '', body: '', type: 'DISCUSSION' });
            setImages([]);
            setBodyTextLength(0);
            navigate(`/categories/${categorySlug}/posts/${postId}`);
        } catch (err) {
            toast.error(err.response?.data?.body.detail.split(":")[1] || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = (e) => {
        if (e.target === e.currentTarget || e.target.tagName === 'IMG') {
            setPreviewIndex(null);
        }
    };

    const handleEscClose = (e) => {
        if (e.key === 'Escape') {
            setPreviewIndex(null);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleEscClose);
        return () => window.removeEventListener('keydown', handleEscClose);
    }, []);

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

    return (
        <DndProvider backend={HTML5Backend}>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4 space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-center">Create Post</h2>

                <input type="hidden" value={categorySlug} {...register('categorySlug')} />

                <div>
                    <label className="block">Post Type</label>
                    <select
                        className="border rounded w-full p-2"
                        {...register('type', { required: 'Post type is required' })}
                    >
                        <option value="DISCUSSION">Discussion</option>
                        <option value="QUESTION">Question</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>

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
                    <label className="block">Attach Images</label>
                    {images.length === 0 && (
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

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 border p-2 rounded">
                            {images.map((file, index) => (
                                <DraggableImage
                                    key={index}
                                    index={index}
                                    file={file}
                                    moveImage={handleImageReorder}
                                    removeImage={removeImage}
                                    onClick={() => setPreviewIndex(index)}
                                />
                            ))}
                            <div
                                {...getRootProps()}
                                className="border border-dashed rounded flex items-center justify-center cursor-pointer h-24 bg-gray-50 hover:bg-gray-100"
                            >
                                <input {...getInputProps()} />
                                <span className="text-gray-500 text-sm">+ Add</span>
                            </div>
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
                        Create Post
                    </button>
                </div>
            </form>

            {previewIndex !== null && images[previewIndex] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={handleModalClose}
                >
                    <img
                        src={URL.createObjectURL(images[previewIndex])}
                        alt="Preview"
                        className="max-w-full max-h-full"
                    />
                </div>
            )}
        </DndProvider>
    );
};

const DraggableImage = ({ file, index, moveImage, removeImage, onClick }) => {
    const [, dragRef] = useDrag({
        type: ItemType,
        item: { index },
    });

    const [, dropRef] = useDrop({
        accept: ItemType,
        drop: (item) => {
            if (item.index !== index) {
                moveImage(item.index, index);
            }
        },
    });

    return (
        <div
            ref={(node) => dragRef(dropRef(node))}
            className="relative border rounded overflow-hidden group cursor-pointer"
            onClick={onClick}
        >
            <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="w-full h-24 object-cover"
            />
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

export default CreatePostPage;