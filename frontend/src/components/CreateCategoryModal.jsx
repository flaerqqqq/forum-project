import { useState, useEffect, useRef } from 'react'; // Import useRef
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define the frontend representations of the backend enum values
const POST_PERMISSION = {
    EVERYONE: 'EVERYONE',
    MEMBERS_ONLY: 'MEMBERS_ONLY',
    MODS_ONLY: 'MODS_ONLY'
};

const VISIBILITY = {
    PUBLIC: 'PUBLIC',
    RESTRICTED: 'RESTRICTED',
    PRIVATE: 'PRIVATE'
};


const CategoryCreateModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [categoryData, setCategoryData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: null, // File object
        banner: null, // File object
        visibility: VISIBILITY.PUBLIC,
        postPermission: POST_PERMISSION.EVERYONE,
    });

    const [loading, setLoading] = useState(false);
    const [previewIcon, setPreviewIcon] = useState(null); // Object URL for preview
    const [previewBanner, setPreviewBanner] = useState(null); // Object URL for preview

    // useRef to hold the Object URLs that need cleanup on unmount
    const iconUrlRef = useRef(null);
    const bannerUrlRef = useRef(null);


    // Effect to handle creating and revoking Object URLs when file state changes
    useEffect(() => {
        // Revoke the previous URLs stored in refs
        if (iconUrlRef.current) {
            URL.revokeObjectURL(iconUrlRef.current);
            iconUrlRef.current = null; // Clear the ref
        }
        if (bannerUrlRef.current) {
            URL.revokeObjectURL(bannerUrlRef.current);
            bannerUrlRef.current = null; // Clear the ref
        }

        // Create new URLs if files exist in state and we are on step 2 (or potentially rendering it)
        // Although the previews only show on step 2, creating URLs here simplifies cleanup logic
        let newIconUrl = null;
        let newBannerUrl = null;

        if (categoryData.icon) {
            newIconUrl = URL.createObjectURL(categoryData.icon);
            setPreviewIcon(newIconUrl);
            iconUrlRef.current = newIconUrl; // Store the new URL in ref for cleanup
        } else {
            setPreviewIcon(null); // Clear preview if file is removed
        }

        if (categoryData.banner) {
            newBannerUrl = URL.createObjectURL(categoryData.banner);
            setPreviewBanner(newBannerUrl);
            bannerUrlRef.current = newBannerUrl; // Store the new URL in ref for cleanup
        } else {
            setPreviewBanner(null); // Clear preview if file is removed
        }

        // Cleanup function that runs when the component unmounts OR before this effect re-runs
        // This revised logic ensures URLs are revoked properly.
        return () => {
            if (iconUrlRef.current) {
                URL.revokeObjectURL(iconUrlRef.current);
            }
            if (bannerUrlRef.current) {
                URL.revokeObjectURL(bannerUrlRef.current);
            }
        };

    }, [categoryData.icon, categoryData.banner]); // Effect runs whenever the file objects in state change


    // Removed the old cleanup effect dependent on previewIcon/banner


    const handleNextStep = () => setStep(step + 1);
    const handlePrevStep = () => setStep(step - 1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        // When a file is selected or deselected, update the file state.
        // The useEffect above will handle creating/revoking the preview URLs.
        setCategoryData({ ...categoryData, [name]: file || null }); // Set to null if file is deselected
    };

    const handleCreateCategory = async () => {
        setLoading(true);
        const token = Cookies.get('token');

        const formData = new FormData();

        const categoryJsonBlob = new Blob([JSON.stringify({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            visibility: categoryData.visibility,
            postPermission: categoryData.postPermission,
        })], { type: 'application/json' });

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
                // Cleanup previews manually just before closing if needed,
                // although the effect's cleanup on unmount should handle it.
                if (previewIcon) URL.revokeObjectURL(previewIcon);
                if (previewBanner) URL.revokeObjectURL(previewBanner);
                onClose();
            } else {
                // Assuming non-201 is an error or handled otherwise
                // The catch block will likely handle network errors etc.
                // For unexpected non-201 success, show a warning.
                toast.warning(`Category creation returned unexpected status: ${response.status}`);
                console.warn('Category creation unexpected response:', response);
                // Decide if you want to close on non-201
                // onClose();
            }
        } catch (err) {
            console.error('Error creating category:', err);
            if (err.response) {
                console.error('Error data:', err.response.data);
                console.error('Error status:', err.response.status);
                if (err.response.data && err.response.data.message) {
                    toast.error(`Error creating category: ${err.response.data.message}`);
                } else {
                    toast.error(`Error creating category. Status: ${err.response.status}`);
                }
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
            className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white p-6 rounded-lg w-96" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-700">
                        {step === 1 ? 'Create Category' : step === 2 ? 'Upload Icon & Banner' : 'Set Permissions'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Step 1: Category Details */}
                {step === 1 && (
                    <div key={1}> {/* Added key={1} */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={categoryData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Category Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={categoryData.slug}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter category slug (e.g., my-awesome-category)"
                                required
                                minLength="3"
                                maxLength="50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={categoryData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter category description"
                                rows="4"
                                maxLength="1000"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Upload Icon & Banner */}
                {step === 2 && (
                    <div key={2}> {/* Added key={2} */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Category Icon (Optional)</label>
                            <input
                                type="file"
                                name="icon"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2 border rounded-md"
                                // You might need to add a key here if replacing the file input element helps
                                // Forcing re-render by key={categoryData.icon?.name || 'icon-input'}
                                // This key would change if a DIFFERENT file is selected, but not if the SAME file is selected again
                                // Let's try without input key first, key on container is more common for step changes.
                            />
                            {/* Add key to image based on the preview URL to ensure re-render if URL changes */}
                            {/* Using previewIcon directly as key assumes it's unique per file instance */}
                            {previewIcon && <img key={previewIcon} src={previewIcon} alt="Icon Preview" className="mt-2 w-16 h-16 object-cover rounded-full" />}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Category Banner (Optional)</label>
                            <input
                                type="file"
                                name="banner"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2 border rounded-md"
                                // key={categoryData.banner?.name || 'banner-input'}
                            />
                            {/* Add key to image based on the preview URL */}
                            {previewBanner && <img key={previewBanner} src={previewBanner} alt="Banner Preview" className="mt-2 w-full h-36 object-cover rounded-md" />}
                        </div>
                    </div>
                )}

                {/* Step 3: Set Visibility & Permissions */}
                {step === 3 && (
                    <div key={3}> {/* Added key={3} */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Visibility</label>
                            <select
                                name="visibility"
                                value={categoryData.visibility}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value={VISIBILITY.PUBLIC}>Public</option>
                                <option value={VISIBILITY.RESTRICTED}>Restricted</option>
                                <option value={VISIBILITY.PRIVATE}>Private</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Post Permission</label>
                            <select
                                name="postPermission"
                                value={categoryData.postPermission}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value={POST_PERMISSION.EVERYONE}>Everyone</option>
                                <option value={POST_PERMISSION.MEMBERS_ONLY}>Members Only</option>
                                <option value={POST_PERMISSION.MODS_ONLY}>Mods Only</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-4">
                    {step > 1 && (
                        <button type="button" onClick={handlePrevStep} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button" // Use type="button" for navigation buttons to prevent unintended form submission
                            onClick={handleNextStep}
                            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${step === 1 && (!categoryData.name.trim() || !categoryData.slug.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={step === 1 && (!categoryData.name.trim() || !categoryData.slug.trim())}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button" // Use type="button" for create button within the modal, handle submit logic manually
                            onClick={handleCreateCategory}
                            disabled={loading}
                            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Create Category'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryCreateModal;