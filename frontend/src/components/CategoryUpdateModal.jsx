import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';

const POST_PERMISSION = {
    EVERYONE: 'EVERYONE',
    MEMBERS_ONLY: 'MEMBERS_ONLY',
    MODS_ONLY: 'MODS_ONLY',
};

const VISIBILITY = {
    PUBLIC: 'PUBLIC',
    RESTRICTED: 'RESTRICTED',
    PRIVATE: 'PRIVATE',
};

const CategoryUpdateModal = ({ onClose, category }) => {
    const [step, setStep] = useState(1);
    const [categoryData, setCategoryData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        icon: null,
        banner: null,
        visibility: category?.visibility || VISIBILITY.PUBLIC,
        postPermission: category?.postPermission || POST_PERMISSION.EVERYONE,
    });

    const [loading, setLoading] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(category?.iconUrl || null);
    const [previewBanner, setPreviewBanner] = useState(category?.bannerUrl || null);

    const iconUrlRef = useRef(null);
    const bannerUrlRef = useRef(null);

    useEffect(() => {
        return () => {
            if (iconUrlRef.current) URL.revokeObjectURL(iconUrlRef.current);
            if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
        };
    }, []);

    useEffect(() => {
        if (categoryData.icon) {
            const newUrl = URL.createObjectURL(categoryData.icon);
            setPreviewIcon(newUrl);
            if (iconUrlRef.current) URL.revokeObjectURL(iconUrlRef.current);
            iconUrlRef.current = newUrl;
        } else if (category?.iconUrl && !previewIcon) {
            setPreviewIcon(category.iconUrl);
        } else if (!categoryData.icon && previewIcon && previewIcon !== category?.iconUrl) {
            URL.revokeObjectURL(previewIcon);
            setPreviewIcon(null);
        }


        if (categoryData.banner) {
            const newUrl = URL.createObjectURL(categoryData.banner);
            setPreviewBanner(newUrl);
            if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
            bannerUrlRef.current = newUrl;
        } else if (category?.bannerUrl && !previewBanner) {
            setPreviewBanner(category.bannerUrl);
        } else if (!categoryData.banner && previewBanner && previewBanner !== category?.bannerUrl) {
            URL.revokeObjectURL(previewBanner);
            setPreviewBanner(null);
        }

    }, [categoryData.icon, categoryData.banner, category?.iconUrl, category?.bannerUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        setCategoryData({ ...categoryData, [name]: file || null });
    };

    const handleUpdateCategory = async () => {
        setLoading(true);
        const token = Cookies.get('token');
        const formData = new FormData();

        const categoryJsonBlob = new Blob(
            [
                JSON.stringify({
                    name: categoryData.name,
                    description: categoryData.description,
                    visibility: categoryData.visibility,
                    postPermission: categoryData.postPermission,
                }),
            ],
            { type: 'application/json' }
        );

        formData.append('data', categoryJsonBlob);

        if (categoryData.icon) formData.append('icon', categoryData.icon);
        if (categoryData.banner) formData.append('banner', categoryData.banner);

        try {
            const response = await axios.put(
                `http://localhost:8080/api/v1/categories/${category?.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success('Category Updated Successfully!');
            onClose(true);
        } catch (err) {
            console.error(err);
            toast.error(err.response.data.body.detail.split(':')[1] || 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseWithoutSubmit = () => {
        onClose(false);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto p-4"
            onClick={(e) => e.target === e.currentTarget && handleCloseWithoutSubmit()}
        >
            <div
                className="relative bg-white p-6 rounded-xl shadow-xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleCloseWithoutSubmit}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
                >
                    ✕
                </button>

                <h3 className="text-2xl font-semibold text-center text-black mb-6">
                    {step === 1
                        ? 'Update Category'
                        : step === 2
                            ? 'Update Icon & Banner'
                            : 'Update Permissions'}
                </h3>

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="category-name"
                                className="text-sm font-medium text-gray-700 mb-1"
                            >
                                Category Name
                            </label>
                            <input
                                id="category-name"
                                type="text"
                                name="name"
                                value={categoryData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md text-black"
                                placeholder="Enter Category Name"
                                maxLength="50"
                            />
                            <p className="text-xs text-gray-500 text-right mt-1">
                                {categoryData.name.length}/50
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="category-description"
                                className="text-sm font-medium text-gray-700 mb-1"
                            >
                                Description
                            </label>
                            <textarea
                                id="category-description"
                                name="description"
                                value={categoryData.description}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md text-black"
                                rows="6"
                                placeholder="Enter Description"
                                maxLength="1000"
                            />
                            <p className="text-xs text-gray-500 text-right mt-1">
                                {categoryData.description.length}/1000
                            </p>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="flex flex-col items-center">
                        <div className="mb-2 w-full max-w-sm">
                            <label
                                htmlFor="icon-upload"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category Icon (Optional)
                            </label>
                            <input
                                id="icon-upload"
                                type="file"
                                name="icon"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                            <label
                                htmlFor="icon-upload"
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors p-4 text-center"
                            >
                                <p className="mt-1 text-sm text-gray-700">
                                    Drag 'n' drop or click to upload icon
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Recommended size: 64x64 or greater.
                                        Max file size: 5MB.
                                    </span>
                                    <br />
                                </p>
                                {categoryData.icon && (
                                    <p className="text-xs text-green-600 mt-1 truncate w-full">
                                        {categoryData.icon.name}
                                    </p>
                                )}
                            </label>
                            {previewIcon && (
                                <img
                                    key={previewIcon}
                                    src={previewIcon}
                                    alt="Icon Preview"
                                    className="mt-4 w-24 h-24 object-cover rounded-full border border-gray-300 mx-auto"
                                />
                            )}
                        </div>

                        <div className="mb-6 w-full max-w-sm">
                            <label
                                htmlFor="banner-upload"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category Banner (Optional)
                            </label>
                            <input
                                id="banner-upload"
                                type="file"
                                name="banner"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                            <label
                                htmlFor="banner-upload"
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors p-4 text-center"
                            >
                                <p className="mt-1 text-sm text-gray-700">
                                    Drag 'n' drop or click to upload banner
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Recommended size: 256x256 or greater.
                                        Max file size: 5MB.
                                    </span>
                                    <br />
                                </p>
                                {categoryData.banner && (
                                    <p className="text-xs text-green-600 mt-1 truncate w-full">
                                        {categoryData.banner.name}
                                    </p>
                                )}
                            </label>
                            {previewBanner && (
                                <img
                                    key={previewBanner}
                                    src={previewBanner}
                                    alt="Banner Preview"
                                    className="mt-4 w-full h-32 object-cover rounded-md border border-gray-300"
                                />
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visibility
                        </label>
                        <select
                            name="visibility"
                            value={categoryData.visibility}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                        >
                            {Object.values(VISIBILITY).map((v) => (
                                <option key={v} value={v}>
                                    {v[0] + v.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Who can post?
                        </label>
                        <select
                            name="postPermission"
                            value={categoryData.postPermission}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                        >
                            {Object.values(POST_PERMISSION).map((v) => (
                                <option key={v} value={v}>
                                    {v[0] + v.slice(1).toLowerCase().replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 bg-gray-300 rounded-md"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="ml-auto px-4 py-2 bg-black text-white rounded-md"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleUpdateCategory}
                            disabled={loading}
                            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
                        >
                            {loading ? (
                                <Oval height={20} width={20} color="#fff" />
                            ) : (
                                'Update'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryUpdateModal;