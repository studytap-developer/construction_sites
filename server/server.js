
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");

// const app = express();
// require("dotenv").config();

// // app.use(cors({ origin: "*" }));

// app.use(cors());
// app.use(express.json());

// // =========================
// // DB CONNECT
// // =========================
// // mongoose
// //   // .connect("mongodb://127.0.0.1:27017/construction")
// //   .connect("mongodb+srv://admin:1234@cluster0.bn4dppa.mongodb.net/construction?retryWrites=true&w=majority")
// //   .then(() => console.log("✅ MongoDB Connected"))
// //   .catch((err) => console.log(err));

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log(err));

// // =========================
// // SCHEMA
// // =========================
// const SiteSchema = new mongoose.Schema({
//   name: String,
//   location: String,
//   details: String,
//   vendors: [
//     {
//       name: String,
//       phone: String,
//       workers: [
//         {
//           name: String,
//           work: String,
//           amount: Number,
//           paid: { type: Number, default: 0 },
//           bill: [String],
//           payments: [
//             {
//               amount: Number,
//               date: { type: Date, default: Date.now },
//             },
//           ],
//         },
//       ],
//     },
//   ],
// });
// const Site = mongoose.model("Site", SiteSchema);

// app.get("/", (req, res) => {
//   res.send("servr is running");
// });

// // =========================
// // LOGIN
// // =========================
// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;
//   if (
//     username === process.env.ADMIN_USERNAME &&
//     password === process.env.ADMIN_PASSWORD
//   ) {
//     return res.json({ message: "Login success" });
//   }
//   return res.status(401).json({ error: "Invalid credentials" });
// });

// // =========================
// // SITE ROUTES
// // =========================


// app.post("/api/sites", async (req, res) => {
//   const site = new Site(req.body);
//   await site.save();
//   res.json(site);
// });

// app.get("/api/sites", async (req, res) => {
//   const sites = await Site.find();
//   res.json(sites);
// });

// // GET SINGLE SITE
// app.get("/api/sites/:id", async (req, res) => {
//   try {
//     const site = await Site.findById(req.params.id);
//     if (!site) {
//       return res.status(404).json({ error: "Site not found" });
//     }
//     res.json(site);




    
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.put("/api/sites/:id", async (req, res) => {
//   const updated = await Site.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   res.json(updated);
// });

// app.delete("/api/sites/:id", async (req, res) => {
//   await Site.findByIdAndDelete(req.params.id);
//   res.json({ message: "Site deleted" });
// });

// // =========================
// // VENDOR ROUTES
// // =========================
// app.post("/api/sites/:id/vendors", async (req, res) => {
//   const site = await Site.findById(req.params.id);
//   site.vendors.push(req.body);
//   await site.save();
//   res.json(site);
// });

// app.put("/api/sites/:siteId/vendors/:vendorIndex", async (req, res) => {
//   const site = await Site.findById(req.params.siteId);
//   const i = Number(req.params.vendorIndex);
//   site.vendors[i].name = req.body.name;
//   site.vendors[i].phone = req.body.phone;
//   await site.save();
//   res.json(site);
// });

// app.delete("/api/sites/:siteId/vendors/:vendorIndex", async (req, res) => {
//   const site = await Site.findById(req.params.siteId);
//   const i = Number(req.params.vendorIndex);
//   site.vendors.splice(i, 1);
//   await site.save();
//   res.json(site);
// });

// // =========================
// // WORKER ROUTES
// // =========================
// app.post("/api/sites/:siteId/vendors/:vendorIndex/workers", async (req, res) => {
//   const site = await Site.findById(req.params.siteId);
//   const i = Number(req.params.vendorIndex);
//   site.vendors[i].workers.push({ ...req.body, paid: 0 });
//   await site.save();
//   res.json(site);
// });

// app.put(
//   "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex",
//   async (req, res) => {
//     const site = await Site.findById(req.params.siteId);
//     const v = Number(req.params.vendorIndex);
//     const w = Number(req.params.workerIndex);

//     const worker = site.vendors[v].workers[w];
//     worker.name = req.body.name;
//     worker.work = req.body.work;
//     worker.amount = Number(req.body.amount);

//     await site.save();
//     res.json(site);
//   }
// );

// app.delete(
//   "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex",
//   async (req, res) => {
//     const site = await Site.findById(req.params.siteId);
//     const v = Number(req.params.vendorIndex);
//     const w = Number(req.params.workerIndex);

//     site.vendors[v].workers.splice(w, 1);
//     await site.save();
//     res.json(site);
//   }
// );

// // =========================
// // PAYMENT
// // =========================
// app.post(
//   "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex/pay",
//   async (req, res) => {
//     const site = await Site.findById(req.params.siteId);
//     const v = Number(req.params.vendorIndex);
//     const w = Number(req.params.workerIndex);

//     const worker = site.vendors[v]?.workers[w];
//     if (!worker) return res.status(400).json({ error: "Worker not found" });

//     const amount = Number(req.body.amount);
//     worker.paid += amount;

//     worker.payments = worker.payments || [];
//     worker.payments.push({ amount, date: new Date() });

//     await site.save();
//     res.json(worker);
//   }
// );

// // =========================
// // BILL DELETE
// // =========================
// app.delete(
//   "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/delete-bill",
//   async (req, res) => {
//     try {
//       const { siteId, vIndex, wIndex } = req.params;

//       const site = await Site.findById(siteId);
//       if (!site) return res.status(404).json({ error: "Site not found" });

//       const v = Number(vIndex);
//       const w = Number(wIndex);

//       if (!site.vendors?.[v])
//         return res.status(404).json({ error: "Vendor not found" });
//       if (!site.vendors[v].workers?.[w])
//         return res.status(404).json({ error: "Worker not found" });

//       const worker = site.vendors[v].workers[w];
//       const billToDelete = req.query.path;

//       if (!billToDelete) {
//         // remove all bills
//         worker.bill = [];
//       } else {
//         if (!Array.isArray(worker.bill)) worker.bill = worker.bill ? [worker.bill] : [];
//         worker.bill = worker.bill.filter((b) => b !== billToDelete);
//       }

//       await site.save();
//       res.json({ message: "Bill deleted successfully" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // =========================
// // FILE UPLOAD (BILL)
// // =========================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// app.post(
//   "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/upload-bill",
//   upload.array("bill", 20),
//   async (req, res) => {
//     try {
//       const { siteId, vIndex, wIndex } = req.params;
//       const site = await Site.findById(siteId);
//       const v = Number(vIndex);
//       const w = Number(wIndex);

//       const worker = site.vendors[v]?.workers[w];
//       if (!worker) return res.status(400).json({ error: "Worker not found" });

//       if (!req.files || req.files.length === 0)
//         return res.status(400).json({ error: "No files uploaded" });

//       const uploaded = req.files.map((file) => `/uploads/${file.filename}`);
//       const billPath = `vendors.${v}.workers.${w}.bill`;

//       let currentBills = Array.isArray(worker.bill) ? worker.bill : (worker.bill ? [worker.bill] : []);
//       currentBills.push(...uploaded);

//       await Site.updateOne(
//         { _id: siteId },
//         { $set: { [billPath]: currentBills } },
//       );

//       res.json({ message: "Bill(s) uploaded", files: uploaded });
//     } catch (err) {
//       console.error('UPLOAD ERROR', err);
//       res.status(500).json({ error: err.message, details: err });
//     }
//   }
// );

// // =========================
// // GET ALL BILLS
// // =========================
// app.get("/api/bills", async (req, res) => {
//   try {
//     const sites = await Site.find();
//     const bills = [];

//     sites.forEach((site) => {
//       site.vendors?.forEach((vendor, vIndex) => {
//         vendor.workers?.forEach((worker, wIndex) => {
//           const workerBills =
//             Array.isArray(worker.bill) && worker.bill.length > 0
//               ? worker.bill
//               : worker.bill
//               ? [worker.bill]
//               : [];

//           workerBills.forEach((billUrl) => {
//             bills.push({
//               siteId: site._id,
//               vendorIndex: vIndex,
//               workerIndex: wIndex,
//               siteName: site.name,
//               vendorName: vendor.name,
//               workerName: worker.name,
//               work: worker.work,
//               amount: worker.amount,
//               paid: worker.paid,
//               bill: billUrl,
//             });
//           });
//         });
//       });
//     });

//     res.json(bills);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // =========================
// // STATIC FILES
// // =========================
// app.use("/uploads", express.static("uploads"));

// // =========================
// // START SERVER
// // =========================
// // app.listen(8000, () => console.log("🚀 Server running on http://localhost:8000"));
// app.listen(8000, () => console.log("🚀 Server running on https://construction-sites-b5y5.onrender.com"));
// // app.listen(8000, () => console.log("🚀 Server running on https://construction-sites-b5y5.onrender.com"));
// // const PORT = process.env.PORT || 8000;

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });













require("dotenv").config(); // ✅ MUST BE FIRST

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =========================
// DEBUG ENV (REMOVE LATER)
// =========================
console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUD_API_KEY);
console.log("API_SECRET:", process.env.CLOUD_API_SECRET ? "OK" : "MISSING");
console.log("MONGO:", process.env.MONGO_URI ? "OK" : "MISSING");

// =========================
// CLOUDINARY SETUP
// =========================
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bills",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// =========================
// MIDDLEWARE
// =========================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// =========================
// DB CONNECT
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err));

// =========================
// SCHEMA
// =========================
const SiteSchema = new mongoose.Schema({
  name: String,
  location: String,
  details: String,
  vendors: [
    {
      name: String,
      phone: String,
      workers: [
        {
          name: String,
          work: String,
          amount: Number,
          paid: { type: Number, default: 0 },
          bill: [String],
          payments: [
            {
              amount: Number,
              date: { type: Date, default: Date.now },
            },
          ],
        },
      ],
    },
  ],
});

const Site = mongoose.model("Site", SiteSchema);

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("🚀 Server Running");
});

// =========================
// LOGIN
// =========================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ message: "Login success" });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// =========================
// SITE ROUTES
// =========================
app.post("/api/sites", async (req, res) => {
  const site = new Site(req.body);
  await site.save();
  res.json(site);
});

app.get("/api/sites", async (req, res) => {
  const sites = await Site.find();
  res.json(sites);
});

app.get("/api/sites/:id", async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: "Site not found" });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/sites/:id", async (req, res) => {
  const updated = await Site.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/api/sites/:id", async (req, res) => {
  await Site.findByIdAndDelete(req.params.id);
  res.json({ message: "Site deleted" });
});

// =========================
// VENDOR
// =========================
app.post("/api/sites/:id/vendors", async (req, res) => {
  const site = await Site.findById(req.params.id);
  site.vendors.push(req.body);
  await site.save();
  res.json(site);
});

app.put("/api/sites/:siteId/vendors/:vIndex", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  const v = Number(req.params.vIndex);

  site.vendors[v].name = req.body.name;
  site.vendors[v].phone = req.body.phone;

  await site.save();
  res.json(site);
});

app.delete("/api/sites/:siteId/vendors/:vIndex", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  site.vendors.splice(Number(req.params.vIndex), 1);
  await site.save();
  res.json(site);
});

// =========================
// WORKERS
// =========================
app.post("/api/sites/:siteId/vendors/:vIndex/workers", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  site.vendors[req.params.vIndex].workers.push({
    ...req.body,
    paid: 0,
  });
  await site.save();
  res.json(site);
});

app.put(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    const worker =
      site.vendors[req.params.vIndex].workers[req.params.wIndex];

    worker.name = req.body.name;
    worker.work = req.body.work;
    worker.amount = req.body.amount;

    await site.save();
    res.json(site);
  }
);

app.delete(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    site.vendors[req.params.vIndex].workers.splice(
      req.params.wIndex,
      1
    );
    await site.save();
    res.json(site);
  }
);

// =========================
// PAYMENT
// =========================
app.post(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/pay",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    const worker =
      site.vendors[req.params.vIndex].workers[req.params.wIndex];

    const amount = Number(req.body.amount);
    worker.paid += amount;

    worker.payments.push({ amount });

    await site.save();
    res.json(worker);
  }
);

// =========================
// UPLOAD BILL
// =========================
app.post(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/upload-bill",
  upload.array("bill", 10),
  async (req, res) => {
    try {
      const site = await Site.findById(req.params.siteId);
      const worker =
        site.vendors[req.params.vIndex].workers[req.params.wIndex];

      const urls = req.files.map((f) => f.path);

      worker.bill = [...(worker.bill || []), ...urls];

      await site.save();

      res.json({ message: "Uploaded", urls });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =========================
// DELETE BILL (FIXED)
// =========================
app.delete(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/delete-bill",
  async (req, res) => {
    try {
      const { path } = req.query;

      console.log("DELETE PATH:", path);

      const site = await Site.findById(req.params.siteId);
      const worker =
        site.vendors[req.params.vIndex].workers[req.params.wIndex];

      // REMOVE FROM DB
      worker.bill = worker.bill.filter((b) => b !== path);

      // DELETE FROM CLOUDINARY (ONLY IF CLOUD URL)
      if (path && path.includes("cloudinary")) {
        try {
          const publicId = path.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`bills/${publicId}`);
        } catch (err) {
          console.log("Cloud delete failed:", err.message);
        }
      }

      await site.save();

      res.json({ message: "Deleted" });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =========================
// START SERVER
// =========================
app.listen(8000, () =>
  console.log("🚀 Server running on port 8000")
);