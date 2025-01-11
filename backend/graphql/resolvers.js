const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const GalleryModel = require('../models/gallery');
const Village = require('../models/Village');
const MessageModel = require('../models/message')
const { GraphQLUpload } = require("graphql-upload-minimal");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const resolvers = {
  Upload: GraphQLUpload,
  Upload: require("graphql-upload-minimal").GraphQLUpload, 
  Query: {
    users: async (_, { role }) => {
      // If `role` is provided, filter by role. Otherwise, return all users.
      const query = role ? { role } : {};
      return await User.find(query);
    },
  
    villages: async () => await Village.find(),
    gallery: async () => await Gallery.find(),
    getUser: async (_, { token }) => {
      try {
        const decoded = jwt.verify(token, 'secretKey');
        return await User.findById(decoded.id);
      } catch (error) {
        throw new Error('Unauthorized');
      }
    },
    messages: async (_, { conversationId }) => {
      try {
        if (!conversationId) {
          throw new Error("conversationId is required.");
        }
        const messages = await MessageModel.find({ conversationId }).sort({ timestamp: 1 });
        return messages;
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages.");
      }
    },
    gallery: async () => {
      try {
        // Fetch images from the database
        const images = await GalleryModel.find(); // Ensure GalleryModel exists
        return images;
      } catch (error) {
        console.error("Failed to fetch gallery images:", error.message);
        throw new Error("Failed to fetch gallery images.");
      }
    },
  },

  Mutation: {
    signup: async (_, { fullName, username, password }) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ fullName, username, password: hashedPassword });
      await user.save();
      return user;
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }
    
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
    
      const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });
      return { token, role: user.role };
    },
    
    
    

    addVillage: async (_, { name, region, landArea, latitude, longitude }) => {
      try {
        const village = new Village({ name, region, landArea, latitude, longitude });
        await village.save();
        return village;
      } catch (error) {
        throw new Error("Failed to add village.");
      }
    },

    updateVillage: async (_, { id, name, region, landArea, latitude, longitude }) => {
      const updatedVillage = await Village.findByIdAndUpdate(
        id,
        { name, region, landArea, latitude, longitude },
        { new: true }
      );
      return updatedVillage;
    },

    deleteVillage: async (_, { id }) => {
      await Village.findByIdAndDelete(id);
      return 'Village deleted successfully';
    },

 
    
    addDemographics: async (_, { id, input }) => {
      const { populationSize, ageDistribution, genderRatios, growthRate } = input;
    
      const updatedVillage = await Village.findByIdAndUpdate(
        id,
        {
          demographics: {
            populationSize,
            ageDistribution,
            genderRatios,
            growthRate,
          },
        },
        { new: true }
      );
    
      return updatedVillage;
    },
    
    uploadImage: async (_, { file, description }) => {
      try {
        console.log("Upload invoked with file and description:", { file, description });
        const { createReadStream, filename } = await file;
        console.log("File details:", { filename });
        const filePath = `uploads/${Date.now()}_${filename}`;
        const stream = createReadStream();

        // Save the file locally
        const out = require("fs").createWriteStream(filePath);
        stream.pipe(out);
        await new Promise((resolve, reject) => {
          out.on("finish", resolve);
          out.on("error", reject);
        });

        console.log("File saved locally:", filePath);

        // Save image details to the database
        const newImage = await GalleryModel.create({
          url: `http://localhost:4000/${filePath}`,
          description,
        });

        console.log("Image saved to database:", newImage);
        return newImage;
      } catch (error) {
        console.error("Error in uploadImage:", error.message);
        throw new Error("Failed to upload image.");
      }
    },
    
    
  },
};






module.exports = resolvers;