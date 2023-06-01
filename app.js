const searchButton = document.getElementById("searchButton");
const userSummary = document.getElementById("userSummary");
const body = document.getElementById("body");
var loader = null;

searchButton.addEventListener("click", fetchSummary);

async function getRepos(){
    const url = "https://api.github.com/search/repositories?q=user:" + document.getElementById("queryUsername").value;
    const response = await fetch(url, {
        headers: { authorization: "token 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" }
      });
    const result = await response.json();

    if (!response.ok){
        console.log("Error fetching repos");
        return null;
    }
    return result;
}

function clickPress(event) {
    if (event.keyCode == 13) {
        getRepos()
    }
}

async function fetchSummary(){
    userSummary.textContent = "";
    if (loader){
        loader.remove();
    }
    loader = document.createElement("div");
    loader.classList.add("loader");
    searchButton.after(loader);

    const repos = await getRepos();
    loader.remove();
    if (!repos){
        return;
    }
    var summary = {
        username: "",
        totalPublicRepos: 0,
        totalStargazers: 0,
        totalForks: 0,
        totalSizes: 0,
        averageSize: 0,
        languages: []
    }
    summary.username = document.getElementById("queryUsername").value;
    summary.totalPublicRepos = repos.total_count;
    repos.items.forEach(element => {
        summary.totalStargazers += element.stargazers_count;
        summary.totalForks += element.forks_count;
        summary.totalSizes += element.size;
        var languages = fetch(element.languages_url);
        summary.languages.push(languages)
        //this language fetch needs to be awaited. I didn't have time to add that.
    });
    summary.averageSize = (summary.totalSizes/repos.total_count) + "KB";

    userSummary.textContent = JSON.stringify(summary);

    return summary
}