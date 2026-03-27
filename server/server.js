
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
require("dotenv").config();

// app.use(cors({ origin: "*" }));

app.use(cors());
app.use(express.json());

// =========================
// DB CONNECT
// =========================
// mongoose
//   // .connect("mongodb://127.0.0.1:27017/construction")
//   .connect("mongodb+srv://admin:1234@cluster0.bn4dppa.mongodb.net/construction?retryWrites=true&w=majority")
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log(err));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

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

app.get("/", (req, res) => {
  res.send("servr is running");
});

// =========================
// LOGIN
// =========================
app.post("/api/login", async (req, res) => {
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

// GET SINGLE SITE
app.get("/api/sites/:id", async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }
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
// VENDOR ROUTES
// =========================
app.post("/api/sites/:id/vendors", async (req, res) => {
  const site = await Site.findById(req.params.id);
  site.vendors.push(req.body);
  await site.save();
  res.json(site);
});

app.put("/api/sites/:siteId/vendors/:vendorIndex", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  const i = Number(req.params.vendorIndex);
  site.vendors[i].name = req.body.name;
  site.vendors[i].phone = req.body.phone;
  await site.save();
  res.json(site);
});

app.delete("/api/sites/:siteId/vendors/:vendorIndex", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  const i = Number(req.params.vendorIndex);
  site.vendors.splice(i, 1);
  await site.save();
  res.json(site);
});

// =========================
// WORKER ROUTES
// =========================
app.post("/api/sites/:siteId/vendors/:vendorIndex/workers", async (req, res) => {
  const site = await Site.findById(req.params.siteId);
  const i = Number(req.params.vendorIndex);
  site.vendors[i].workers.push({ ...req.body, paid: 0 });
  await site.save();
  res.json(site);
});

app.put(
  "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    const v = Number(req.params.vendorIndex);
    const w = Number(req.params.workerIndex);

    const worker = site.vendors[v].workers[w];
    worker.name = req.body.name;
    worker.work = req.body.work;
    worker.amount = Number(req.body.amount);

    await site.save();
    res.json(site);
  }
);

app.delete(
  "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    const v = Number(req.params.vendorIndex);
    const w = Number(req.params.workerIndex);

    site.vendors[v].workers.splice(w, 1);
    await site.save();
    res.json(site);
  }
);

// =========================
// PAYMENT
// =========================
app.post(
  "/api/sites/:siteId/vendors/:vendorIndex/workers/:workerIndex/pay",
  async (req, res) => {
    const site = await Site.findById(req.params.siteId);
    const v = Number(req.params.vendorIndex);
    const w = Number(req.params.workerIndex);

    const worker = site.vendors[v]?.workers[w];
    if (!worker) return res.status(400).json({ error: "Worker not found" });

    const amount = Number(req.body.amount);
    worker.paid += amount;

    worker.payments = worker.payments || [];
    worker.payments.push({ amount, date: new Date() });

    await site.save();
    res.json(worker);
  }
);

// =========================
// BILL DELETE
// =========================
app.delete(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/delete-bill",
  async (req, res) => {
    try {
      const { siteId, vIndex, wIndex } = req.params;

      const site = await Site.findById(siteId);
      if (!site) return res.status(404).json({ error: "Site not found" });

      const v = Number(vIndex);
      const w = Number(wIndex);

      if (!site.vendors?.[v])
        return res.status(404).json({ error: "Vendor not found" });
      if (!site.vendors[v].workers?.[w])
        return res.status(404).json({ error: "Worker not found" });

      const worker = site.vendors[v].workers[w];
      const billToDelete = req.query.path;

      if (!billToDelete) {
        // remove all bills
        worker.bill = [];
      } else {
        if (!Array.isArray(worker.bill)) worker.bill = worker.bill ? [worker.bill] : [];
        worker.bill = worker.bill.filter((b) => b !== billToDelete);
      }

      await site.save();
      res.json({ message: "Bill deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =========================
// FILE UPLOAD (BILL)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post(
  "/api/sites/:siteId/vendors/:vIndex/workers/:wIndex/upload-bill",
  upload.array("bill", 20),
  async (req, res) => {
    try {
      const { siteId, vIndex, wIndex } = req.params;
      const site = await Site.findById(siteId);
      const v = Number(vIndex);
      const w = Number(wIndex);

      const worker = site.vendors[v]?.workers[w];
      if (!worker) return res.status(400).json({ error: "Worker not found" });

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: "No files uploaded" });

      const uploaded = req.files.map((file) => `/uploads/${file.filename}`);
      const billPath = `vendors.${v}.workers.${w}.bill`;

      let currentBills = Array.isArray(worker.bill) ? worker.bill : (worker.bill ? [worker.bill] : []);
      currentBills.push(...uploaded);

      await Site.updateOne(
        { _id: siteId },
        { $set: { [billPath]: currentBills } },
      );

      res.json({ message: "Bill(s) uploaded", files: uploaded });
    } catch (err) {
      console.error('UPLOAD ERROR', err);
      res.status(500).json({ error: err.message, details: err });
    }
  }
);

// =========================
// GET ALL BILLS
// =========================
app.get("/api/bills", async (req, res) => {
  try {
    const sites = await Site.find();
    const bills = [];

    sites.forEach((site) => {
      site.vendors?.forEach((vendor, vIndex) => {
        vendor.workers?.forEach((worker, wIndex) => {
          const workerBills =
            Array.isArray(worker.bill) && worker.bill.length > 0
              ? worker.bill
              : worker.bill
              ? [worker.bill]
              : [];

          workerBills.forEach((billUrl) => {
            bills.push({
              siteId: site._id,
              vendorIndex: vIndex,
              workerIndex: wIndex,
              siteName: site.name,
              vendorName: vendor.name,
              workerName: worker.name,
              work: worker.work,
              amount: worker.amount,
              paid: worker.paid,
              bill: billUrl,
            });
          });
        });
      });
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static("uploads"));

// =========================
// START SERVER
// =========================
// app.listen(8000, () => console.log("🚀 Server running on http://localhost:8000"));

// app.listen(8000, () => console.log("🚀 Server running on https://construction-sites-1.onrender.com/"));
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});







// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");

// const app = express();
// require("dotenv").config();

// // =========================
// // ✅ CORS FIX
// // =========================
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://construction-sites-1.onrender.com",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );


// // =========================
// // MIDDLEWARE
// // =========================
// app.use(express.json());

// // =========================
// // DB CONNECT
// // =========================
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

// // =========================
// // ROOT
// // =========================
// app.get("/", (req, res) => {
//   res.send("Server running 🚀");
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

// app.get("/api/sites/:id", async (req, res) => {
//   try {
//     const site = await Site.findById(req.params.id);
//     if (!site) return res.status(404).json({ error: "Site not found" });
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

//     worker.payments.push({ amount, date: new Date() });

//     await site.save();
//     res.json(worker);
//   }
// );

// // =========================
// // FILE UPLOAD
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

//       const uploaded = req.files.map((file) => `/uploads/${file.filename}`);

//       worker.bill = worker.bill || [];
//       worker.bill.push(...uploaded);

//       await site.save();

//       res.json({ message: "Uploaded", files: uploaded });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // =========================
// // STATIC FILES
// // =========================
// app.use("/uploads", express.static("uploads"));

// // =========================
// // ⚠️ VERY IMPORTANT FIX
// // React build should be LAST
// // =========================
// // app.use(express.static(path.join(__dirname, "client/build")));

// // app.get("/*", (req, res) => {
// //   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// // });

// // =========================
// // START SERVER
// // =========================
// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () =>
//   console.log(`🚀 Server running on port ${PORT}`)
// );