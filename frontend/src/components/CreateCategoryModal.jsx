import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Oval } from 'react-loader-spinner';
import {useNavigate} from 'react-router-dom';
import {useFollowedCategories} from '../contexts/FollowedCategoriesContext.jsx'

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

const CategoryCreateModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [categoryData, setCategoryData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: null,
        banner: null,
        visibility: VISIBILITY.PUBLIC,
        postPermission: POST_PERMISSION.EVERYONE,
    });

    const [loading, setLoading] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);
    const navigate = useNavigate();
    const {addFollowedCategory} = useFollowedCategories();

    const iconUrlRef = useRef(null);
    const bannerUrlRef = useRef(null);

    useEffect(() => {
        return () => {
            if (iconUrlRef.current) URL.revokeObjectURL(iconUrlRef.current);
            if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
        };
    }, []);

    useEffect(() => {
        let newIconUrl = null;
        let newBannerUrl = null;

        if (categoryData.icon) {
            newIconUrl = URL.createObjectURL(categoryData.icon);
            setPreviewIcon(newIconUrl);
            if (iconUrlRef.current) URL.revokeObjectURL(iconUrlRef.current);
            iconUrlRef.current = newIconUrl;
        } else {
            if (iconUrlRef.current) URL.revokeObjectURL(iconUrlRef.current);
            iconUrlRef.current = null;
            setPreviewIcon(null);
        }

        if (categoryData.banner) {
            newBannerUrl = URL.createObjectURL(categoryData.banner);
            setPreviewBanner(newBannerUrl);
            if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
            bannerUrlRef.current = newBannerUrl;
        } else {
            if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
            bannerUrlRef.current = null;
            setPreviewBanner(null);
        }

    }, [categoryData.icon, categoryData.banner]);


    const handleNextStep = () => setStep(step + 1);
    const handlePrevStep = () => setStep(step - 1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        setCategoryData({ ...categoryData, [name]: file || null });
    };

    const handleCreateCategory = async () => {
        setLoading(true);
        const token = Cookies.get('token');

        const formData = new FormData();

        const categoryJsonBlob = new Blob(
            [
                JSON.stringify({
                    name: categoryData.name,
                    slug: categoryData.slug,
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
            const response = await axios.post(
                'http://localhost:8080/api/v1/categories',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                toast.success('Category Created Successfully!');
                if (previewIcon) URL.revokeObjectURL(previewIcon);
                if (previewBanner) URL.revokeObjectURL(previewBanner);
                onClose();
                addFollowedCategory(categoryData.slug);
                navigate('/categories/' + categoryData.slug);
            } else {
                toast.warning(
                    `Category creation returned unexpected status: ${response.status}`
                );
                console.warn('Category creation unexpected response:', response);
            }
        } catch (err) {
            console.error('Error creating category:', err);
            if (err.response) {
                console.error('Error data:', err.response.data);
                console.error('Error status:', err.response.status);
                const errorMessage = err.response.data?.body?.detail || `Error creating category. Status: ${err.response.status}`;
                toast.error(errorMessage);
            } else if (err.request) {
                toast.error('Error creating category: No response from server.');
            } else {
                toast.error(`Error creating category: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto p-4" // Changed z-index to z-[999]
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative bg-white p-6 rounded-xl shadow-xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-center text-black">
                        {step === 1
                            ? 'Create Category'
                            : step === 2
                                ? 'Upload Icon & Banner'
                                : 'Set Permissions'}
                    </h3>
                </div>

                {step === 1 && (
                    <div className="flex flex-col items-center">
                        <div className="mb-4 w-full max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={categoryData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        <div className="mb-4 w-full max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Slug
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={categoryData.slug}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
                                placeholder="Enter category slug (e.g., my-awesome-category)"
                                required
                                minLength="3"
                                maxLength="50"
                            />
                        </div>
                        <div className="mb-4 w-full max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                name="description"
                                value={categoryData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
                                placeholder="Enter category description"
                                rows="4"
                                maxLength="1000"
                            />
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
                    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                        <div className="mb-4 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visibility
                            </label>
                            <select
                                name="visibility"
                                value={categoryData.visibility}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
                            >
                                {Object.values(VISIBILITY).map((option) => (
                                    <option key={option} value={option}>
                                        {option[0] + option.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Who can post?
                            </label>
                            <select
                                name="postPermission"
                                value={categoryData.postPermission}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
                            >
                                {Object.values(POST_PERMISSION).map((option) => (
                                    <option key={option} value={option}>
                                        {option[0] + option.slice(1).toLowerCase().replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-6">
                    {step > 1 && (
                        <button
                            onClick={handlePrevStep}
                            className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={handleNextStep}
                            className="ml-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateCategory}
                            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <Oval height={20} width={20} color="#fff" secondaryColor="#4ade80" />
                            ) : (
                                'Create'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryCreateModal;