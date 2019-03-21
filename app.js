// Require - Start
//-> importa os frameworkers

const express = require("express"); // -> Framework Express
const bodyParser = require("body-parser"); // -> Framework para Express
const mongoose = require("mongoose"); // -> Framework para o MongoDB
const _ = require("lodash"); // -> Framework Lodash


// APP -> recebe a função express() do framework express
// app -> É o aplicativo ou a aplicação
const app = express();

// App Set -> Ativa o uso do EJS na Aplicação (APP)
app.set('view engine', 'ejs');

// Ativa o uso do Body-Parser na Aplicação (APP)
app.use(bodyParser.urlencoded({extended: true}));

// Permite o acesso da pasta "/public" na Aplicação (APP)
app.use(express.static("public"));

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>

// Cria ou Connecta com o MongoDB -> Database: todoListDB
mongoose.connect("mongodb+srv://admin-tsuda:HlGt3231@cluster0-nsrgn.mongodb.net/todoListDB", {useNewUrlParser: true});

// Mongoose Schema -> é um modelo que facilita a criação de novos objetos no banco de dados
// itemsSchema -> esquema dos itens da checklist
const itemsSchema = {name: String};                  // <== itemsSchema

const listSchema = {                                 // <== listSchema
  name: String,
  items: [itemsSchema]
};

// Mongoose -> valida o itemsSchema e cria uma coleção chamada Items (que vem do primeiro argumento do methodo mongoose.model())
const Item = mongoose.model("Item", itemsSchema); // (*1) <== Mongoose Model Items
const List = mongoose.model("List", listSchema);  //  <== Mongoose Model List

// Valores padrão (Default Items) -> 3 items 
const itemOne = new Item({
  name: "Welcome to your todo list."
});
const itemTwo = new Item({
  name: "Hit the + button to add a new item."
});
const itemThree = new Item({
  name: "<- Hit this to delete an item."
});

// Array dos Valores Padrões (Default Array).
const defaultItems = [itemOne, itemTwo, itemThree];

// 

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>


// Quando o usuário entra no root "/" 
app.get("/", function (req, res) {

  Item.find({},function(err, foundItems){

    if(foundItems.length===0){

      Item.insertMany(defaultItems, function(err){
          if(err) 
            	console.log(err);
          else{
            console.log("Successfully Saved Default Itens to DB");
          }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today",newListItems:foundItems});
    }
  });
});


// Quando envia uma informação para "/"
// Essa função permite adicionar novos itens na coleção "items"
app.post("/", function (req, res) {

  console.log(req.body);
  const itemName = req.body.newItem;  // itemName <- recebe o texto 
  const listName = req.body.list;     // listName <- recebe o nome da lista

  // Cria o novo objeto > salva o novo item para adicionar em em alguma lista
  const newItem = new Item({name: itemName});

  // Controla o local onde a informação é salva e redireciona apropriadademente
  if(listName === "Today"){
    // Today ==> Rota ("/")
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(newItem);List
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>

// Quando envia informação para rota "/delete"
// Deleta o objeto da coleção "items"
app.post("/delete", function(req,res){
  // Recebe o valor enviado do html (ejs)
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName ==="Today"){
    // Metodo do Mongoose para encontrar e remover usando ID 
    Item.findByIdAndRemove(checkedItemID, err => {
      if (err) console.log(err);
      else console.log("Remove successfully");
    });
    // Redireciona para rota "/"
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}}, function(err, findOne){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  };
});

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>

// Rota para a página About
app.get("/about", function (req, res) {
  res.render("about");
});

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>

// Routeamente por middleware -> roteamento dinâmico que cria uma nova coleção (collection) no bancos de dados (todoListDB) 
app.get("/:topic", function (req, res) {
  // Altera o valor da listTitle para o parametro topico -> https://expressjs.com/en/guide/using-middleware.html 
  const listTitle = _.capitalize(req.params.topic); // <- Recebe o parametro do /:topic
  List.findOne({name:listTitle}, function(err, foundList){  // <-- Metodo mongoose modal de busca por apenas um
    if(err) console.log(err); // <-- Printa o erro caso ocorra
    else{
      // Verifica se existe o item procurado
      if(foundList){
        // Caso exista -> renderize uma página utilizando a informação no DB
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
        
      } else{
        // Caso não exista -> crie os valores padrão e redirecione para a mesma página
        const list = new List({
          name: listTitle,
          items: defaultItems
        });
        
        list.save();
        res.redirect("/"+listTitle);
      } 
    }
  });
  
});

// ==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>==<>
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// Ativa o server e esperar acesso na porta:3000
app.listen(port, function () {
  console.log("Server started has started successfully.");
});