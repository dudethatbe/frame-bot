// recursive request not resolving correcrtly :\
const { Dropbox } = require("dropbox");
const path = require("path");
const dbx = new Dropbox({ accessToken: process.env.ACCESS_TOKEN });

function getFoldersContinue(cursor, continuePath, results, finish) {
  dbx
    .filesListFolderContinue({ cursor: cursor })
    .then(response => {
      const entries = response.result.entries;
      results = results.concat(entries);
      if (response.result.has_more) {
        getFoldersContinue(
          response.result.cursor,
          continuePath,
          results,
          finish
        );
      } else {
        finish(results);
      }
    })
    .catch(finish);
}
async function getDropboxEntries(dbxPath) {
  return new Promise((resolve, reject) => {
    return dbx
      .filesListFolder({ path: dbxPath })
      .then(response => {
        if (response.result.has_more) {
          getFoldersContinue(
            response.result.cursor,
            dbxPath,
            response.result.entries,
            resolve
          );
        } else {
          resolve(response.result.entries);
        }
      })
      .catch(reject);
  });
}
async function getFolders(dbxPath, keys = new Set(), response = {}) {
  if (!response.hasOwnProperty("size")) {
    response["size"] = 0;
  }
  const entries = await getDropboxEntries(dbxPath);
  console.log(`${entries.length} from ${dbxPath}`);
  for (const entry of entries) {
    const entryPath = `${dbxPath}/${entry.name}`;
    let key = path.dirname(entry.path_lower);
    if (!keys.has(key)) {
      // use Set shortcut methods to check if its been used before
      keys.add(key);
      // store entries in an array per key
      response[key] = [];
    }
    if (entry[".tag"] === "folder") {
      await getFolders(entryPath, keys, response);
    } else {
      response[key].push(entryPath);
      response.size += parseInt(entry.size);
    }
  }

  return response;
}
async function countUploads() {
  const entries = await getFolders(process.env.FOLDER);
  const keys = Object.keys(entries).filter(f => {
    return entries[f].length > 0;
  });
  console.log(`counted ${keys.length} folders`);
  let sum = 0;
  keys.forEach(k => {
    if (entries[k].length) {
      sum += entries[k].length;
    }
  });
  console.log(`counted ${sum} files`);
  console.log(`estimated size (GB): ${(entries.size * 1e-9).toFixed(2)}`);
}
module.exports = {
  countUploads: countUploads
};
