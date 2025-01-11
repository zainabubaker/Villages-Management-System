import React from "react";
import { useQuery, gql } from "@apollo/client";

// GraphQL Query to fetch gallery images
const GET_GALLERY_IMAGES = gql`
  query GetGalleryImages {
    gallery {
      id
      url
      description
    }
  }
`;

const UserGallery = () => {
  const { loading, error, data } = useQuery(GET_GALLERY_IMAGES);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-gray-400">Browse images uploaded by the admin</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {data.gallery.length > 0 ? (
          data.gallery.map((img) => (
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
          ))
        ) : (
          <p className="text-gray-400 col-span-3 text-center">
            No images available at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserGallery;
