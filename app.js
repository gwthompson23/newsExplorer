var express = require("express");
var path = require('path');
var app = express();
var bodyParser = require("body-parser");
var NewsAPI = require("newsapi");
var newsapi = new NewsAPI('feaffd76e8ff410080b0624c4fcd20d3');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));


/*
	Retrieves articles from a given category and stores them in the given array
	This allows us to later pass these arrays into the home page
*/
async function getArticles(category, page, searchTerm){
	var articles = [];

	await newsapi.v2.topHeadlines({
		category: category,
		page: page,
		country: "us",
		q: searchTerm
	}).then(response => {
		//console.log(response.articles[0]);
		articles = response.articles;
	});

	return articles;
}

// Home root redirects to a viewing route
app.get("/", function(req, res){
	res.redirect("/view/sports/1/");
});

// Get root for searches without a key term to search for
app.get("/view/:category/:page", async function(req, res){
	var page = parseInt(req.params.page);
	var prevPage = page - 1;
	if(page > 5) page = 5;
	var category = req.params.category;
	var searchTerm = "";
	
	// Getting articles from the three desired categories
	var articles = await getArticles(category, page, "");
	if(page <= 1 && articles.length == 0){
		res.render("noResults", {category:category, searchTerm:searchTerm});
	}
	else{
		if(articles.length == 0) res.redirect("/view/" + category + "/" + prevPage);
		else if(page < 1) res.redirect("/view/" + category + "/1");
		else res.render("home",  {articles:articles, page:page, category:category, searchTerm:searchTerm});
	}
});

// Get root for searches with a key term to search for
app.get("/view/:category/:page/:searchTerm", async function(req, res){
	var searchTerm = req.params.searchTerm.toLowerCase();
	var page = parseInt(req.params.page);
	if(page > 5) page = 5;
	var prevPage = page - 1;
	var category = req.params.category;
	
	// Getting articles from the three desired categories
	var articles = await getArticles(category, page, searchTerm);
	if(page <= 1 && articles.length == 0){
		res.render("noResults", {category:category, searchTerm:searchTerm});
	}
	else{
		if(articles.length == 0) res.redirect("/view/" + category + "/" + prevPage + "/" + searchTerm);
		else if(page < 1) res.redirect("/view/" + category + "/1/" + searchTerm);
		else res.render("home",  {articles:articles, page:page, category:category, searchTerm:searchTerm});
	}
	
});

// Send any invalid URLs to default page
app.get("/*", function(req, res){
	res.redirect("/view/sports/1/");
})

// Gets a request for a certain search term and redirects to the proper page
app.post("/newSearch", function(req, res){
	var keySearch = req.body.keySearch;
	var category = req.body.category;
	res.redirect("/view/" + category + "/1/" + keySearch);
});

// Gets a request for a certain search term and redirects to the proper page
app.post("/changeCategory", function(req, res){
	var category = req.body.categorySelect;
	res.redirect("/view/" + category + "/1");
});

// Gets the previous page of results
app.post("/prevPage", function(req,res){
	var page = parseInt(req.body.pageNum);
	var prevPage = page - 1;
	var category = req.body.category;
	var searchTerm = req.body.searchTerm;
	res.redirect("/view/" + category + "/" + prevPage + "/" + searchTerm);
});

// Gets the next page of results
app.post("/nextPage", function(req,res){
	var page = parseInt(req.body.pageNum);
	var nextPage = page + 1;
	var category = req.body.category;
	var searchTerm = req.body.searchTerm;
	res.redirect("/view/" + category + "/" + nextPage + "/" + searchTerm);
});

// Tell Express to listen for requests (start server)
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("Sever listening on port " + port)
});


// Helper functions for ejs files
app.locals.stringToDate = function(date){
		var year = date.substring(0, 4);
		var month = parseInt(date.substring(5, 7));
		var day = date.substring(8, 10);
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return months[month] + " " + day + ", " + year;
}