/*
	Shopify backend summer 18 challenge
	Name: Mohamed Kazma
	Node.js v 8.9.3 (Javascript)  
*/

// ASSUMPTIONS: THE DATA APPEARS TO BE IN SORTED IN A MIN HEAP LIKE STRUCTURE SO WE CAN CHECK FOR CYCLES 
// BY CHECKING IF UR ID IS LESS THAN THAT OF ANY OF UR CHILDREN

// request library for api requests 
let request = require('request');

// query value of page for api requests
let query = 1; 

// url for api request 
//let url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=";
let url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=2&page=";

// object that stores the menus and pagination values 
let menuObject = {menus: [] , pagination: {}};

// api request call 
request(url + query , apiCallback); 

// api request callback
function apiCallback(err , response , body)
{
	// check for error 
	if (err) throw err;

	// parse values of the api request if there is any 
	if (JSON.parse(body).menus.length != 0)
	{
		// concatonate array values 
		menuObject.menus = menuObject.menus.concat(JSON.parse(body).menus);
		menuObject.pagination = JSON.parse(body).pagination;
	}	

	//check if we have all the data
	if (menuObject.menus.length >= menuObject.pagination.total)
	{
		//we have all the data
		console.log(menuObject.menus);
		
		// check for cycles and return the valid and invalid menus
		let result = checkCycles(menuObject.menus);

		console.log("valid menus: ");
		console.log(result.valid_menus);
		console.log("invalid menus: ")
		console.log(result.invalid_menus);
	}
	else
	{
		// make another api request and increment the query 
		query++;
		request(url + query , apiCallback);
	}
}

// checks for cycles in a menu and separates them into valid and invalid menus
function checkCycles (menus)
{
	// object to store result 
	let result = {valid_menus: [] , invalid_menus: []};

	// Check for invalid menus
	for (i in menus)
	{
		// Iterate through children (CHECK THIS SHITTTTTT)
		for (j in menus[i].child_ids)
		{
			// Cycles check
			if (menus[i].id > menus[i].child_ids[j])
			{
				console.log("we have a cycle");
				let root = menus[i].child_ids[j];
				result.invalid_menus.push({root: root , children: addChildren(menus , root - 1 , root)});	
			}
		}
	}

	// Check for valid menus it is what is not in invalid menus
	for(i in menus)
	{
		// Checks if it is a root of a cycle 
		isCycleRoot = false;

		// Checking if it is a root 
		if (menus[i].parent_id === undefined)
		{
			//iterate through invalid menus
			for (j in result.invalid_menus)
			{
				// check if this root is in invalid menus 
				if(menus[i].id === result.invalid_menus[j].root)
				{
					// It is a cycle root
					isCycleRoot = true;
					break;
				}
			}

			// Not a root of a cycle
			if(!isCycleRoot)
			{
				let root = menus[i].id;
				result.valid_menus.push({root : root, children : addChildren(menus , root - 1 , root)});
			}
		}
	}

	return result;
}

// add children of a certain root node 
function addChildren (menus , index , cycleRoot)
{
	// array that stores the children 
	let children = [];

	// Helper function for the recursion
	function helper (menus , index , cycleRoot)
	{	
		// go through children and add them to the children array 
		// then call the same function on each of those children
		for (i in menus[index].child_ids)
		{
			let child = menus[index].child_ids[i];

			if (child != cycleRoot)
			{
				children.push(child);
				helper(menus , child - 1 , cycleRoot);
			}
		}
	}

	// call recursive function to add children
	helper(menus , index , cycleRoot);
	return children;
}