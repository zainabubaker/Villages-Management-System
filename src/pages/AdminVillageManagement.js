import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";

// GraphQL Queries and Mutations
const GET_VILLAGES = gql`
query {
  villages {
    id
    name
    region
    landArea
    latitude
    longitude
  }
}
`;

const ADD_VILLAGE = gql`
mutation AddVillage(
    $name: String!
    $region: String!
    $landArea: Float!
    $latitude: Float!
    $longitude: Float!
  ) {
    addVillage(
      name: $name
      region: $region
      landArea: $landArea
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      name
      region
      landArea
      latitude
      longitude
    }
  }
`;

const DELETE_VILLAGE = gql`
  mutation DeleteVillage($id: ID!) {
    deleteVillage(id: $id)
  }
`;

const UPDATE_VILLAGE = gql`
   mutation UpdateVillage(
    $id: ID!
    $name: String!
    $region: String!
    $landArea: Float!
    $latitude: Float!
    $longitude: Float!
  ) {
    updateVillage(
      id: $id
      name: $name
      region: $region
      landArea: $landArea
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      name
      region
      landArea
      latitude
      longitude
    }
  }
`;
const ADD_DEMOGRAPHIC_DATA = gql`
  mutation AddDemographicData($id: ID!, $input: DemographicsInput!) {
    addDemographics(id: $id, input: $input) {
      id
      demographics {
        populationSize
        ageDistribution {
          age_0_14
          age_15_64
          age_65_plus
        }
        genderRatios {
          male
          female
        }
        growthRate
      }
    }
  }
`;



const AdminVillageManagement = () => {
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const navigate = useNavigate();

  // GraphQL Hooks
  const { loading, error, data, refetch } = useQuery(GET_VILLAGES);
  const [addVillage] = useMutation(ADD_VILLAGE, {
    onCompleted: () => {
      
      refetch(); // Refresh the villages list after successful addition
      
    },
    onError: (error) => {
      console.error("Error adding village:", error);
      alert(error.message || "An error occurred while adding the village.");
    },
  });
  const [deleteVillage] = useMutation(DELETE_VILLAGE, {
    onCompleted: () => refetch(),
  });
  const [updateVillage] = useMutation(UPDATE_VILLAGE, {
    onCompleted: () => refetch(),
  });
  const [addDemographics] = useMutation(ADD_DEMOGRAPHIC_DATA, {
    onCompleted: () => refetch(),
  });

  if (loading) return <p>Loading villages...</p>;
  if (error) return <p>Error fetching villages: {error.message}</p>;

  const villages = data.villages;

  const handleAddVillage = async (newVillage) => {
    try {
      const { data } = await addVillage({
        variables: {
          name: newVillage.name, // String
          region: newVillage.region, // String
          landArea: parseFloat(newVillage.landArea), // Float
          latitude: parseFloat(newVillage.latitude), // Float
          longitude: parseFloat(newVillage.longitude), // Float
        },
      });
  
      if (data?.addVillage) {
        alert("Village added successfully!");
        refetch();
        setShowModal(null);
      }
    } catch (err) {
      console.error("Error adding village:", err);
      alert(err.message || "An error occurred while adding the village.");
    }
  };
  
  
  

  const handleDeleteVillage = async (id) => {
    try {
      await deleteVillage({ variables: { id } });
      alert("Village deleted successfully!");
    } catch (err) {
      console.error("Error deleting village:", err);
      alert("An error occurred while deleting the village.");
    }
  };

  const handleUpdateVillage = async (updatedVillage) => {
    try {
      const { data } = await updateVillage({
        variables: {
          id: updatedVillage.id, // Pass the village ID here
          name: updatedVillage.name,
          region: updatedVillage.region,
          landArea: parseFloat(updatedVillage.landArea),
          latitude: parseFloat(updatedVillage.latitude),
          longitude: parseFloat(updatedVillage.longitude),
        },
      });
  
      if (data?.updateVillage) {
        alert("Village updated successfully!");
        refetch(); // Re-fetch the updated list of villages
      }
    } catch (err) {
      console.error("Error updating village:", err);
      alert(err.message || "An error occurred while updating the village.");
    }
  };
  const handleAddDemographicData = async (villageId, demographicData) => {
    try {
      const { data } = await addDemographics({
        variables: {
          id: villageId,
          input: demographicData,
        },
      });
      if (data) {
        alert("Demographic data added successfully!");
        setShowModal(null);
      }
    } catch (err) {
      console.error("Error adding demographic data:", err);
      alert(err.message || "An error occurred while adding demographic data.");
    }
  };
  
  

  const sortedVillages =
    sortOrder === "alphabetical"
      ? [...villages].sort((a, b) => a.name.localeCompare(b.name))
      : villages;

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-4 bg-gray-100">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Village Management</h1>
          <button onClick={() => setShowModal("add")} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add New Village
          </button>
        </header>

        <div className="mb-4">
          <label className="mr-2">Sort by:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 rounded">
            <option value="default">Default</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2">Village Name</th>
              <th className="p-2">Region/District</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedVillages.map((village) => (
              <tr key={village.id}>
                <td className="p-2">{village.name}</td>
                <td className="p-2">{village.region}</td>
                <td className="p-2">
                  <button
                    onClick={() => {
                      setSelectedVillage(village);
                      setShowModal("view");
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVillage(village);
                      setShowModal("update");
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteVillage(village.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVillage(village);
                      setShowModal("demographic");
                    }}
                    className="bg-purple-500 text-white px-2 py-1 rounded"
                  >
                    Update Demographic Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {showModal === "add" && <AddVillageModal onClose={() => setShowModal(null)} onSubmit={handleAddVillage} />}
      {showModal === "update" && selectedVillage && (
        <UpdateVillageModal village={selectedVillage} onClose={() => setShowModal(null)} onSubmit={handleUpdateVillage} />
      )}
      {showModal === "view" && selectedVillage && (
        <ViewVillageModal village={selectedVillage} onClose={() => setShowModal(null)} />
      )}
      {showModal === "demographic" && selectedVillage && (
        <AddDemographicsModal
          village={selectedVillage}
          onClose={() => setShowModal(null)}
          onSubmit={handleAddDemographicData}
        />
      )}
    </div>
  );
};

// Define your modal components (`AddVillageModal`, `UpdateVillageModal`, `ViewVillageModal`, `AddDemographicModal`) in a similar way as before, with updated GraphQL mutations and queries.
const AddVillageModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [landArea, setLandArea] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !region || !landArea || !latitude || !longitude) {
      alert("Please fill in all fields.");
      return;
    }

    const newVillage = {
      name,
      region,
      landArea: parseFloat(landArea),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    onSubmit(newVillage);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form className="bg-white p-6 rounded shadow-lg w-1/3" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Add New Village</h2>
        <input
          type="text"
          placeholder="Village Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Region/District"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Land Area (sq km)"
          value={landArea}
          onChange={(e) => setLandArea(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};


const ViewVillageModal = ({ village, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-1/3">
      <h2 className="text-xl font-bold mb-4">Village Details</h2>
      <p>
        <strong>Village Name:</strong> {village.name}
      </p>
      <p>
        <strong>Region/District:</strong> {village.region}
      </p>
      <p>
        <strong>Land Area (sq km):</strong> {village.landArea}
      </p>
      <p>
        <strong>Latitude:</strong> {village.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {village.longitude}
      </p>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const UpdateVillageModal = ({ village, onClose, onSubmit }) => {
  const [name, setName] = useState(village.name);
  const [region, setRegion] = useState(village.region);
  const [landArea, setLandArea] = useState(village.landArea);
  const [latitude, setLatitude] = useState(village.latitude);
  const [longitude, setLongitude] = useState(village.longitude);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !region || !landArea || !latitude || !longitude) {
      alert("Please fill in all fields.");
      return;
    }
    const updatedVillage = { ...village, name, region, landArea, latitude, longitude };
    onSubmit(updatedVillage);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form className="bg-white p-6 rounded shadow-lg w-1/3" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Update Village</h2>
        <input
          type="text"
          placeholder="Village Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Region/District"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Land Area (sq km)"
          value={landArea}
          onChange={(e) => setLandArea(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

const AddDemographicsModal = ({ village, onClose, onSubmit }) => {
  const [populationSize, setPopulationSize] = useState(village.demographics?.populationSize || "");
  const [age_0_14, setAge_0_14] = useState(village.demographics?.ageDistribution?.age_0_14 || "");
  const [age_15_64, setAge_15_64] = useState(village.demographics?.ageDistribution?.age_15_64 || "");
  const [age_65_plus, setAge_65_plus] = useState(village.demographics?.ageDistribution?.age_65_plus || "");
  const [male, setMale] = useState(village.demographics?.genderRatios?.male || "");
  const [female, setFemale] = useState(village.demographics?.genderRatios?.female || "");
  const [growthRate, setGrowthRate] = useState(village.demographics?.growthRate || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!populationSize || !age_0_14 || !age_15_64 || !age_65_plus || !male || !female || !growthRate) {
      alert("Please fill in all fields.");
      return;
    }
    const demographicData = {
      populationSize: parseInt(populationSize),
      ageDistribution: {
        age_0_14: parseInt(age_0_14),
        age_15_64: parseInt(age_15_64),
        age_65_plus: parseInt(age_65_plus),
      },
      genderRatios: {
        male: parseInt(male),
        female: parseInt(female),
      },
      growthRate: parseFloat(growthRate),
    };
    onSubmit(village.id, demographicData); // Call the function to add demographics
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form className="bg-white p-6 rounded shadow-lg w-1/3" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Add Demographic Data for {village.name}</h2>
        <input
          type="number"
          placeholder="Population Size"
          value={populationSize}
          onChange={(e) => setPopulationSize(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Age Distribution (0-14)"
          value={age_0_14}
          onChange={(e) => setAge_0_14(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Age Distribution (15-64)"
          value={age_15_64}
          onChange={(e) => setAge_15_64(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Age Distribution (65+)"
          value={age_65_plus}
          onChange={(e) => setAge_65_plus(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Gender Ratios (Male)"
          value={male}
          onChange={(e) => setMale(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Gender Ratios (Female)"
          value={female}
          onChange={(e) => setFemale(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Population Growth Rate (%)"
          value={growthRate}
          onChange={(e) => setGrowthRate(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Demographic Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminVillageManagement;
