const express = require("express");
const serveIndex = require("serve-index");
const wget = require("wget-improved");
const splitFile = require("split-file");

const PORT = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("hello world 🌏");
});

app.use("/public", serveIndex("public"));
app.use("/public", express.static("public"));

app.post("/downfile", (req, res) => {
  console.log(req.query);
  const { fileurl, filename } = req.query;
  downloadFile(fileurl, filename);
  res.send(req.query);
});

const downloadFile = (fileurl, filename) => {
  const src = fileurl;
  // "https://software.download.prss.microsoft.com/sg/Win10_21H2_English_x64.iso?t=1f7a0edf-0f6d-4d2b-92e7-eb4c8eedb6c7&e=1646498878&h=ae3486c6d27d398f87c69db4af36c19b43eaa5665636c6e7b71399811329b553";
  // const src = 'https://download.microsoft.com/download/b/0/5/b053c6bc-fc07-4785-a66a-63c5aeb715a9/MediaCreationTool21H2.exe';
  const output = `./public/${filename}`;
  // "./windows10.iso";

  let download = wget.download(src, output);
  download.on("error", function (err) {
    console.log(err);
  });
  download.on("start", function (fileSize) {
    console.log(fileSize);
  });
  download.on("end", function (output) {
    console.log(output);
  });
  download.on("progress", function (progress) {
    if ((progress.toFixed(2) * 100) % 10 == 0) {
      console.log(progress.toFixed(2) * 100);
    }
  });
};

app.post("/splitfile", (req, res) => {
  const { filename, splitsize } = req.query;
  const splitFilesName = splittingFiles(filename, splitsize);
  res.send(`split file names ${splitFilesName}`);
});

const splittingFiles = (filename, splitsize) => {
  let splitnames = [];
  splitFile
    .splitFileBySize(`./public/${filename}`, splitsize)
    .then((names) => {
      splitnames = names;
      console.log(names);
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
  return splitnames;
};

app.post("/mergefile", (req, res) => {
  const { splitFileNames, filename } = req.query;
  const mergedfile = mergeingFiles(splitFileNames, filename);
  res.send(`split file names ${mergedfile}`);
});
/*
const mergeingFiles = (splitFileNames, filename) => {
  splitFile
    .mergeFiles(
      [
        "Med.exe.sf-part1",
        "Med.exe.sf-part2",
        "Med.exe.sf-part3",
        "Med.exe.sf-part4",
      ],
      "./medmere.exe"
    )
    .then(() => {
      console.log("Done!");
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};
*/
app.listen(PORT, () => {
  console.log(`> Server running at ${PORT}`);
});
