const express = require("express")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 3001

const dbPath = path.join(__dirname, "application.db")

let db = null

const create_nessessary_tables = async () => {
    console.log('Creating nessessary tables');
    await db.run(`
        CREATE TABLE IF NOT EXISTS user (
            username VARCHAR(50),
            password TEXT,
            display_name TEXT,
            created_at DATETIME
        );
    `)

    await db.run(`
        CREATE TABLE IF NOT EXISTS blog (
            blog_id TEXT NOT NULL PRIMARY KEY,
            blog TEXT,
            created_at DATETIME,
            username VARCHAR(50) NOT NULL  REFERENCES user (username) ON DELETE CASCADE
        );
    `)

    await db.run(`
        CREATE TABLE IF NOT EXISTS comment (
            comment_id TEXT NOT NULL PRIMARY KEY,
            comment TEXT,
            created_at DATETIME,
            blog_id TEXT NOT NULL REFERENCES blog (id) ON DELETE CASCADE,
            username VARCHAR(50) NOT NULL  REFERENCES user (username) ON DELETE CASCADE
        );
    `)
}

const initializeDBAndStartServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        await create_nessessary_tables()

        app.listen(PORT, () => console.log(`Server started with PORT_NUMBER = ${PORT}`))
    }
    catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

initializeDBAndStartServer()

app.get("/", (request, response) => {
    response.sendFile("landing_page/index.html", { root: __dirname }, (err) => err && console.log(err))
})

const authenticateToken = async (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"]
    if (authHeader) {
        jwtToken = authHeader.split(" ")[1]
    }

    if (!jwtToken) {
        response.statusCode = 401
        response.send('Invalid JWT_TOKEN')
    }
    else {
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", (error, payload) => {
            if (error) {
                response.statusCode = 401
                response.send('Invalid JWT_TOKEN')
            }
            else {
                request.username = payload.username
                next()
            }
        })
    }
}

app.post("/register", async (request, response) => {
    const { username, password, displayName } = request.body

    const GET_USER_SQL_QUERY = `SELECT * FROM user WHERE username = '${username}'`
    const userDetails = await db.get(GET_USER_SQL_QUERY)

    if (!userDetails) {
        const hashedPassword = await bcrypt.hash(password, 6)

        const createdAt = new Date(Date.now())

        const INSERT_USER_QUERY = `INSERT INTO user
                (username, password, display_name, created_at)
                VALUES
                ('${username}', '${hashedPassword}', '${displayName}', '${createdAt}');`

        const dbResponse = await db.run(INSERT_USER_QUERY)
        response.send(`User created with ${dbResponse.lastID}`)
    } else {
        response.statusCode = 401
        response.send("username already exists")
    }
})

app.post("/login", async (request, response) => {
    const { username, password } = request.body

    const GET_USER_SQL_QUERY = `SELECT * FROM user WHERE username = '${username}'`
    const userDetails = await db.get(GET_USER_SQL_QUERY)

    if (!userDetails) {
        response.statusCode = 400
        response.send('Invalid username')
    }
    else {
        const isPasswordMatched = await bcrypt.compare(password, userDetails.password)

        if (!isPasswordMatched) {
            response.statusCode = 400
            response.send('Invalid password')
        }
        else {
            const payload = { username: username }
            const jwt_token = jwt.sign(payload, "MY_SECRET_TOKEN")
            response.send(jwt_token)
        }
    }
})

app.get("/profile", authenticateToken, async (request, response) => {
    const username = request.username
    console.log(username);
    const GET_USER_SQL_QUERY = `SELECT 
            username, display_name, created_at
            FROM user 
            WHERE username = '${username}'`

    const dbResponse = await db.get(GET_USER_SQL_QUERY)

    response.send(JSON.stringify(dbResponse))
})

app.get("/blogs", authenticateToken, async (request, response) => {
    const username = request.username
    const GET_BLOGS_SQL_QUERY = `SELECT * FROM blog;`
    const dbResponse = await db.all(GET_BLOGS_SQL_QUERY)
    response.send(dbResponse)
})

app.get("/blogs/:blogId", authenticateToken, async (request, response) => {
    const username = request.username
    const { blogId } = request.params

    const GET_BLOG_SQL_QUERY = `SELECT * FROM blog WHERE blog_id = ${blogId};`
    const dbResponse = await db.get(GET_BLOG_SQL_QUERY)
    response.send(`blog with ${blogId} deleted successfully`)
})

app.post("/blogs", authenticateToken, async (request, response) => {
    const username = request.username
    const { blog, blogId } = request.body

    const POST_BLOG_SQL_QUERY = `INSERT INTO blog
        (blog_id, blog, created_at, username)
        VALUES 
        ('${blogId}', '${blog}', '${new Date(Date.now())}', '${username}')
    `
    const dbResponse = await db.run(POST_BLOG_SQL_QUERY)
    response.send(`Blog created successfully with ${dbResponse.lastID}`)
})

app.put("/blogs/:blogId", authenticateToken, async (request, response) => {
    const { blogId } = request.params
    const { blog } = request.body

    const PUT_BLOG_SQL_QUERY = `UPDATE blog
    SET blog = '${blog}'
    WHERE blog_id = ${blogId};`
    const dbResponse = await db.run(PUT_BLOG_SQL_QUERY)
    response.send(`blog with ${blogId} updated successfully`)
})

app.delete("/blogs/:blogId", authenticateToken, async (request, response) => {
    const { blogId } = request.params

    const DELETE_BLOG_SQL_QUERY = `DELETE FROM blog WHERE blog_id = ${blogId};`
    const dbResponse = await db.run(DELETE_BLOG_SQL_QUERY)
    response.send(dbResponse)
})

app.get("/blogs/:blogId/comments", authenticateToken, async (request, response) => {
    const username = request.username
    const { blogId } = request.params

    const GET_COMMENTS_SQL_QUERY = `SELECT * FROM comment 
        WHERE blog_id = '${blogId}';`
    const dbResponse = await db.all(GET_COMMENTS_SQL_QUERY)
    response.send(dbResponse)
})

app.get("/blogs/comments/:commentId", authenticateToken, async (request, response) => {
    const { commentId } = request.params

    const UPDATE_A_COMMENT_SQL_QUERY = `SELECT * FROM comment
        WHERE comment_id = '${commentId}';`

    const dbResponse = await db.get(UPDATE_A_COMMENT_SQL_QUERY)
    response.send(dbResponse)
})

app.post("/blogs/:blogId/comments", authenticateToken, async (request, response) => {
    const username = request.username
    const { blogId } = request.params
    const { commentId, comment } = request.body

    const POST_A_COMMENT_SQL_QUERY = `INSERT INTO comment
        (comment_id, comment, created_at, blog_id, username)
        VALUES ('${commentId}', '${comment}', '${new Date(Date.now())}', '${blogId}', '${username}');`

    const dbResponse = await db.run(POST_A_COMMENT_SQL_QUERY)
    response.send(`commented to ${blogId} with ${dbResponse.lastID}`)
})

app.put("/blogs/comments/:commentId", authenticateToken, async (request, response) => {
    const { commentId } = request.params
    const { comment } = request.body

    const UPDATE_A_COMMENT_SQL_QUERY = `UPDATE comment
        SET comment = '${comment}'
        WHERE comment_id = '${commentId}''
        ;`

    const dbResponse = await db.run(UPDATE_A_COMMENT_SQL_QUERY)
    response.send(`comment updated successfully`)
})

app.delete("/blogs/comments/:commentId", authenticateToken, async (request, response) => {
    const { commentId } = request.params

    const UPDATE_A_COMMENT_SQL_QUERY = `DELETE FROM comment
        WHERE comment_id = '${commentId}';`

    const dbResponse = await db.run(UPDATE_A_COMMENT_SQL_QUERY)
    response.send(`comment deleted successfully`)
})
