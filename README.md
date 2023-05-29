<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://cdn-icons-png.flaticon.com/512/906/906334.png" alt="Project logo"></a>
</p>

<h3 align="center"><strong>Epytodo</strong> - Introduction to web</h3>

---

<p align="center"> 
    <strong>Epytodo</strong> is an Epitech project introducing us to Javascript, Node.js, mysql and globally to web developement (more on the backend side).
    <br> 
</p>

## 📝 Table of Contents

- [📝 Table of Contents](#-table-of-contents)
- [🧐 About ](#-about-)
- [💻 Features ](#-features-)
- [➕ To improve ](#-to-improve-)
- [🤖 Testing the program ](#-testing-the-program-)
- [📆 Conclusion ](#-conclusion-)
- [✍️ Authors ](#️-authors-)

## 🧐 About <a name="about"></a>

<strong>From 28 april 2023 to 18 may 2023</strong>

The goal of this project was to create a todo-list program based on Node.js, only on a backend side and by using Express and mysql.

## 💻 Features <a name="features"></a>

Our final result was 16/22. We achieved to implement the required features:
- A mysql database
- Every routes
- Authentification based on tokenisation (jsonwebtoken and bcryptjs modules)
- To keep informations in the db (users infos and todo-lists associated to them)

## ➕ To improve <a name="more"></a>

Here is why we didn't get all the points:
  - Error codes and messages (be careful with this)
  - Error handling (not directly asked on the subject but still mandatory)

## 🤖 Testing the program <a name="tests"></a>

First of all, you have to install `Node`, `curl` and `mysql` on your computer. *Please note that using curl is not mandatory to test your project and that Postman/Insomnia are available as well*

You will have to create a new database. To do so, you must access the mysql terminal with the `sudo mysql -u root -p` command (you can also create a new user with better permissions to avoid using sudo)
I'll let you find out how to create new tables by yourself.

Now lets go into the repository. To install required dependencies do `npm i`.
Now you will have to fill the **.env** file at the root of the repository with different informations:
- **MYSQL_DATABASE** is the name of your db
- **MYSQL_HOST** is localhost
- **MYSQL_USER** is your username (should be root or an user your created earlier)
- **MYSQL_ROOT_PASSWORD** is the password you need to access your user db
- **SECRET** is a passphrase that you will need to use and remember of when you will create new tokens

⚠️ **The content of this file must not be pushed into a repository** ⚠️

Finally, you can start the server with `node .` or `node src/index.js` commands and interact with it by using curl as the following:
```bash
curl -X GET localhost:3000/
```

If you want to use any other route, you will need to use -H flag to include new informations as a `Content-Type` or an `Authentification`.<br>For example you can do:
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "user6@example.com",
  "name": "John Doe",
  "firstname": "John",
  "password": "password123"
}' localhost:3000/register
```

## 📆 Conclusion <a name="conclusion"></a>

I had a hard time understanding how do javascript and mysql were working (fortunately Elouan was here to save us lmao) but this project sure did help us discovering these new languages, above all after a whole year doing C. We were still disappointed to see that we had a D grade even with 16 points so don't do the same mistakes and don't forget to check error handling and error messages/codes.

## ✍️ Authors <a name="authors"></a>

- [@CapucheGianni](https://github.com/capuchegianni) - Epitech 1st year student
- [@ElouanR](https://github.com/ElouanR) - Epitech 1st year student
- [@AugustinPif](https://github.com/AugustinPif) - Epitech 1st year student
