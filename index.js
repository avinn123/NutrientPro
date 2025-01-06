import express, { query } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import  fullNutrients from "./public/json/nutrients.json" with { type: "json" };

const port = 3000;
const app = express();
console.log(fullNutrients[0].name);

let config = {    
    'headers': {
      'Content-Type': 'application/json',
      'x-app-id': '44c95922',
      'x-app-key':'3f3c29d12939d77c3b5bc07f7c84f4e5'
    }
};

const API_URL = 'https://trackapi.nutritionix.com'
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res) => {
    res.render("index.ejs");

});

app.post("/submit", async (req,res) => {
    const foodName = req.body.foodName;
    const foodType = req.body.type;
    config['params']={query:foodName};
    console.log(config);
        
    // const searchURL = API_URL+'pizza';
    try {
        const response = await axios.get(API_URL+"/v2/search/instant",config);
        const result = response.data; //response.data;
        console.log(req.body);
        // console.log(searchURL);
        console.log(result[foodType]);
        // console.log(result);
        res.render("index.ejs", { result: result[foodType],queriedFood:foodName});
      } catch (error) {
        console.error("Server side error!", error.message);
        res.status(500);
      }

});

app.post('/getNutrients/:searchQuery', async (req,res) => {
    const foodName = req.params.searchQuery;
    
    console.log("#######################From POST#######################")
    console.log(foodName);
    config = {    
        'headers': {
          'Content-Type': 'application/json',
          'x-app-id': '44c95922',
          'x-app-key':'3f3c29d12939d77c3b5bc07f7c84f4e5'
        }
    };

    try {
        const response = await axios.post(API_URL+"/v2/natural/nutrients",{query:req.params.searchQuery},config);
        const result = response.data; //response.data;
        const nutrientsArray = result.foods[0].full_nutrients;
        const foodImage = result.foods[0].photo.highres;
        const foodThumb = result.foods[0].photo.thumb;
        var nutrientValues = [];
        
        let i =0;
        // console.log(Object.keys(fullNutrients));


        for(let foodNutrient of nutrientsArray){
            for(let nutrient of fullNutrients){
                if (foodNutrient.attr_id == nutrient.attr_id){
                    var nutrientValue = {};
                    nutrientValue['nutriName']=nutrient.name;
                    nutrientValue['nutriValue']=foodNutrient.value;
                    i += 1;
                    // console.log(nutrientValue);
                    
                    break;
                }
                
            }
            nutrientValues.push(nutrientValue);
            // console.log(nutrientValue);
            // console.log("++++++++++++++++++++++++++++++++++FIrst ELement+++++++++++++++++++")
            // console.log(nutrientValues[0]);   
            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        }
        
        for(i=0;i<10;i++){
            console.log(nutrientValues[i].nutriName,nutrientValues[i].nutriValue);
        }
        res.render("nutrients.ejs", { queriedFood:foodName,image:foodImage,output:nutrientValues,thumb:foodThumb});
      } catch (error) {
        console.error("Server side error!", error.message);
        res.render("nutrients.ejs",{queriedFood:foodName,err:"No results found for "});
      }
});

app.listen(port, (req,res) => {
console.log(`Server Created and listening to port ${port}`);
});