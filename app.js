const searchButton = document.getElementById("searchButton");
const queryUsername = document.getElementById("queryUsername");
const includeForksButton = document.getElementById("includeForksButton");
const printAsJSONButton = document.getElementById("printAsJSONButton");
const userSummary = document.getElementById("userSummary");
const body = document.getElementById("body");

var loader = null;
var token = 'TOKEN_HERE';
var headers = {
    method: 'GET',
    headers:
    {
        'Authorization': 'token ' + token
    },
}
//Lazy load the printed results to avoid calling the API more times than necessary
var summaryJSON = "";
var summaryPretty = "";

//Event handlers

searchButton.addEventListener("click", createSummary);
queryUsername.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        createSummary();
    }
});
printAsJSONButton.addEventListener("change", function(e) {
    updateSummaryView();
})

//API Functions

async function getReposByPage(username, pageNum = 1){
    const url = "https://api.github.com/users/" + username + "/repos?q=user:" + username + "&per_page=100&page=" + pageNum;
    const response = await fetch(url, headers);

    if (response.status == 404){
        userSummary.textContent = "User not found";
        return null
    }
    else if (!response.ok){
        console.log("Error fetching repos");
        return null;
    }
    return await response.json();
}

//Will return the languages used by a single repository given a single URL to that repo's language list.
async function getLanguagesByRepo(repoLanguagesURL){
    var response = await fetch(repoLanguagesURL, headers);
    return await response.json();
}


//Helpers

//Given a username, this will return all repositories belonging to a specified user
async function getAllRepos(username){
    var allRepos = [];
    var pageNum = 1;
    var page = await getReposByPage(username, pageNum);
    allRepos = page;

    while (page.length != 0){
        pageNum += 1;
        page = await getReposByPage(username, pageNum);
        allRepos = [...allRepos, ...page];
    }
    
    return allRepos;
}

//Given a list of URLs that point the languages of repositories, this function will return an ordered list of all languages along with their respective number of occurances.
async function getLanguages(repoLanguageURLs){
    var languages = [];
    var promises = [];
    repoLanguageURLs.forEach(link => {
        promises.push(getLanguagesByRepo(link));
    });
    var results = await Promise.all(promises);
    
    for (let i = 0; i < results.length; i++){ //for each repo...
        for (let language in results[i]){ //for each language in each repo...
            if (Object.hasOwn(languages, language)){
                languages[language] += 1;
            }
            else{
                languages[language] = 1;
            }
        }
    }
    var sortedList = Object.entries(languages).sort((a,b) => b[1]-a[1])
    return sortedList;
}

//This function returns an object containing information summarizing a user's repositories.
//It will also update the screen with either a stringified json object or a prettier equivalent.
async function createSummary(){
    //clear everything first
    userSummary.textContent = "";
    if (loader){
        loader.remove();
    }
    loader = document.createElement("div");
    loader.classList.add("loader");
    searchButton.after(loader);

    const repos = await getAllRepos(queryUsername.value);
    loader.remove();
    if (!repos){
        return;
    }
    var summary = {
        username: "",
        totalRepos: 0,
        totalStargazers: 0,
        totalForks: 0,
        totalSizes: 0,
        averageSize: 0,
        languages: []
    }
    summaryJSON = "";
    summaryPretty = "";
    var repoLanguageURLs = [];

    var includeForks = includeForksButton.checked;

    //fill out the summary object
    summary.username = queryUsername.value;
    summary.totalRepos = repos.length;
    repos.forEach(element => {
        if (element.fork && !includeForks){
            summary.totalRepos -= 1;
            return;
        }
        summary.totalStargazers += element.stargazers_count;
        summary.totalForks += element.forks_count;
        summary.totalSizes += element.size;
        repoLanguageURLs.push(element.languages_url);
    });
    summary.averageSize = (summary.totalRepos > 0 ? (summary.totalSizes/summary.totalRepos) : 0) + "KB";
    summary.totalSizes += "KB";
    summary.languages = await getLanguages(repoLanguageURLs);

    summaryJSON = JSON.stringify(summary);

    summaryPretty = 
    "Username: " + summary.username + "\r\n" +
    "Total Repositories: " + summary.totalRepos + "\r\n" +
    "Total Stargazers: " + summary.totalStargazers + "\r\n" +
    "Total Forks: " + summary.totalForks + "\r\n" +
    "Size of all repos: " + summary.totalSizes + "\r\n" +
    "Average repo size: " + summary.averageSize + "\r\n" +
    "Languages:"  + "\r\n";
    var languageList = "";
    for (let [key, value] of Object.entries(summary.languages)){
        languageList += "\t" + value[0] + ": " + value[1] + "\r\n";
    }
    summaryPretty += languageList;

    updateSummaryView();

    return summary;
}

function updateSummaryView(){
    if (printAsJSONButton.checked) {
        userSummary.textContent = summaryJSON;
        userSummary.style["whiteSpace"] = "pre-line";
    }
    else{
        userSummary.textContent = summaryPretty;
        userSummary.style["whiteSpace"] = "pre";
    }
}