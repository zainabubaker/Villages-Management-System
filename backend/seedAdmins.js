const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seedAdmins = async () => {
  try {
    await mongoose.connect("mongodb+srv://zainabubaker2002:qLPVFU.vLk2WBWe@villagemanagement.i6egh.mongodb.net/?retryWrites=true&w=majority&appName=VillageManagement", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admins = [
      {
        fullName: "Admin One",
        username: "admin1",
        password: await bcrypt.hash("12345", 10),
        role: "admin",
      },
      {
        fullName: "Admin Two",
        username: "admin2",
        password: await bcrypt.hash("12345", 10),
        role: "admin",
      },
    ];

    for (const admin of admins) {
      const existingAdmin = await User.findOne({ username: admin.username });
      if (!existingAdmin) {
        await User.create(admin);
        console.log(`Admin ${admin.username} created.`);
      } else {
        console.log(`Admin ${admin.username} already exists.`);
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding admins:", error);
    mongoose.connection.close();
  }
};

seedAdmins();
