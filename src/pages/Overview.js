import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { useQuery, gql } from "@apollo/client";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// GraphQL queries
const GET_VILLAGES = gql`
  query GetVillages {
    villages {
      id
      name
      region
      landArea
      latitude
      longitude
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

const GET_USER = gql`
  query GetUser($token: String!) {
    getUser(token: $token) {
      fullName
    }
  }
`;

const Overview = () => {
  const [villages, setVillages] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalVillages: 0,
    totalPopulation: 0,
    averageLandArea: 0,
  });
  const [chartsData, setChartsData] = useState({
    ageDistribution: { labels: [], datasets: [] },
    genderRatios: { labels: [], datasets: [] },
    populationByVillage: { labels: [], datasets: [] },
  });
  const token = localStorage.getItem("token");
  const [fullName, setFullName] = useState("");

  const { data: villagesData, loading: villagesLoading } = useQuery(GET_VILLAGES);
  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { token },
    skip: !token,
  });

  useEffect(() => {
    if (userData?.getUser?.fullName) {
      setFullName(userData.getUser.fullName);
    }
  }, [userData]);

  useEffect(() => {
    if (villagesLoading) return;

    const villages = villagesData?.villages || [];
    setVillages(villages);

    // Calculate summary data
    const totalVillages = villages.length;
    const totalPopulation = villages.reduce(
      (sum, v) => sum + (v.demographics?.populationSize || 0),
      0
    );
    const averageLandArea = (
      villages.reduce((sum, v) => sum + (v.landArea || 0), 0) / totalVillages
    ).toFixed(2);

    setSummaryData({ totalVillages, totalPopulation, averageLandArea });

    // Prepare chart data
    const ageDistribution = prepareAgeDistributionData(villages);
    const genderRatios = prepareGenderRatiosData(villages);
    const populationByVillage = preparePopulationByVillageData(villages);

    setChartsData({ ageDistribution, genderRatios, populationByVillage });
  }, [villagesData]);

  const prepareAgeDistributionData = (villages) => {
    const ageGroups = ["0-14", "15-64", "65+"];
    const ageData = ageGroups.map((group) =>
      villages.reduce((sum, v) => {
        const ageDist = v.demographics?.ageDistribution;
        if (!ageDist) return sum;
        return (
          sum +
          (group === "0-14"
            ? ageDist.age_0_14 || 0
            : group === "15-64"
            ? ageDist.age_15_64 || 0
            : ageDist.age_65_plus || 0)
        );
      }, 0)
    );

    return {
      labels: ageGroups,
      datasets: [
        {
          data: ageData,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    };
  };

  const prepareGenderRatiosData = (villages) => {
    let male = 0;
    let female = 0;

    villages.forEach((v) => {
      const genderRatios = v.demographics?.genderRatios;
      if (genderRatios) {
        male += genderRatios.male || 0;
        female += genderRatios.female || 0;
      }
    });

    return {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [male, female],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };
  };

  const preparePopulationByVillageData = (villages) => {
    return {
      labels: villages.map((v) => v.name || "Unknown"),
      datasets: [
        {
          label: "Population",
          data: villages.map((v) => v.demographics?.populationSize || 0),
          backgroundColor: "#36A2EB",
          borderColor: "#36A2EB",
          borderWidth: 1,
        },
      ],
    };
  };

  if (villagesLoading || userLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <p>Welcome, {fullName || "User"}!</p>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      {/* Map Section */}
      <div className="mb-6">
        <MapContainer center={[31.9522, 35.2332]} zoom={8} className="w-full h-80 rounded">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {villages.map((v) => (
            <Marker
              key={v.id}
              position={[v.latitude || 31.9522, v.longitude || 35.2332]}
            />
          ))}
        </MapContainer>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Total Villages</h2>
          <p className="text-2xl">{summaryData.totalVillages}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Total Population</h2>
          <p className="text-2xl">{summaryData.totalPopulation}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-bold">Average Land Area</h2>
          <p className="text-2xl">{summaryData.averageLandArea} sq km</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Age Distribution</h2>
          {chartsData.ageDistribution.labels.length > 0 ? (
            <Pie data={chartsData.ageDistribution} />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Gender Ratios</h2>
          {chartsData.genderRatios.labels.length > 0 ? (
            <Pie data={chartsData.genderRatios} />
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow mt-6">
        <h2 className="text-lg font-bold mb-4">Population by Village</h2>
        {chartsData.populationByVillage.labels.length > 0 ? (
          <Bar data={chartsData.populationByVillage} />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Overview;
