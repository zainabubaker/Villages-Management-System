import React from 'react';

function VillageCard({ village, onView, onEdit, onDelete }) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-white">{village.name}</h3>
      <p className="text-gray-400">{village.region}</p>
      <div className="mt-2 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => onView(village)}>View</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => onEdit(village)}>Edit</button>
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => onDelete(village)}>Delete</button>
      </div>
    </div>
  );
}

export default VillageCard;
