import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_GALLERY_IMAGES = gql`
  query GetGalleryImages {
    gallery {
      id
      url
      description
    }
  }
`;

const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!, $description: String!) {
    uploadImage(file: $file, description: $description) {
      id
      url
      description
    }
  }
`;

const Gallery = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_GALLERY_IMAGES);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);

  const handleImageUpload = async () => {
    if (!selectedImageFile || !description.trim()) {
      alert("Please select an image and provide a description.");
      return;
    }

    setIsUploading(true); // Show loading state

    try {
      const response = await uploadImage({
        variables: {
          file: selectedImageFile,
          description,
        },
      });

      console.log("Upload response:", response);

      if (response.data && response.data.uploadImage) {
        alert("Image uploaded successfully!");
        setShowModal(false);
        refetch(); // Refetch gallery images
        setSelectedImageFile(null);
        setDescription("");
      } else {
        console.error("No data in response:", response);
        alert("An error occurred while uploading the image.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("An error occurred while uploading the image.");
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Image
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {data.gallery.map((img) => (
          <div
            key={img.id}
            className="bg-gray-800 p-4 rounded shadow flex flex-col items-center"
          >
            <img
              src={img.url}
              alt={img.description}
              className="w-full h-32 object-cover mb-2 rounded"
            />
            <p className="text-sm">{img.description}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Image</h2>
            <input
              type="file"
              name="image"
              onChange={(e) => setSelectedImageFile(e.target.files[0])}
              className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded"
            />
            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
