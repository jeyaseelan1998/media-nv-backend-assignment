# Endpoints

base url : https://media-nv-backend-assignment.onrender.com/

```
    const options = {
        method: [api method],
        headers: {
            Authorization: "Bearer jwt_key"
        }
        body: JSON.strigify(data)
    }
```

## Register

#### Endpoint : ```/register```
#### method: **POST**
#### body: 
```
{
    username: "tamil", 
    password: '1234'm
    displayName: 'Tamil K'
}
```


## Login

#### Endpoint : ```/login```
#### method: **POST**
#### body: 
```
{
    username: "tamil", 
    password: '1234'
}
```
#### Response:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRhbWlsIiwiaWF0IjoxNzA5MTg2MDE4fQ.ImQ5ZkEXahTfQygojE9zChavkdWFnWwPWYqR0FhF49I
```

## Get all blog posts

#### Endpoint : ```/blogs```
#### method: **GET**
#### Response:
```
[
  {
    "blog_id": "12",
    "blog": "New updated blog content",
    "created_at": "Thu Feb 29 2024 10:15:06 GMT+0530 (India Standard Time)",
    "username": "tamil"
  },
  ...
]
```

## Get a specific blog post

#### Endpoint : ```/blogs/:blogId```
#### method: **GET**
#### Response:
```
{
    "blog_id": "12",
    "blog": "New updated blog content",
    "created_at": "Thu Feb 29 2024 10:15:06 GMT+0530 (India Standard Time)",
    "username": "tamil"
}
```

## Update a specific blog post

#### Endpoint : ```/blogs/:blogId```
#### method: **PUT**
#### Body: 
```
{
    "blog": "New updated blog content"
}
```
#### Response:
```
Blog updated successfully
```

## Delete a specific blog post

#### Endpoint : ```/blogs/:blogId```
#### method: **DELETE**
#### Response:
```
Blog deleted successfully
```

## Get all comments for a blog post

#### Endpoint : ```/blogs/:blogId/comments```
#### method: **GET**
#### Response:
```
[
  {
    "comment_id": "124",
    "comment": "yes its nice",
    "created_at": "Thu Feb 29 2024 10:49:41 GMT+0530 (India Standard Time)",
    "blog_id": "12",
    "username": "tamil"
  },
  ...
]
```

## Get a specific comment

#### Endpoint : ```/blogs/comments/:commentId```
#### method: **GET**
#### Response:
```
{
"comment_id": "124",
"comment": "yes its nice",
"created_at": "Thu Feb 29 2024 10:49:41 GMT+0530 (India Standard Time)",
"blog_id": "12",
"username": "tamil"
}
```

## Creatw a comment for a blog

#### Endpoint : ```/blogs/:blogId/comments```
#### method: **POST**
#### Body: 
```
{
    "commentId": "124",
    "comment" : "yes its nice"
}
```
#### Response:
```
commented to ${blogId} with ${dbResponse.lastID}
```


## Update a specific comment

#### Endpoint : ```/blogs/comments/:commentId```
#### method: **PUT**
#### Body: 
```
{
    "comment": "update comment here"
}
```
#### Response:
```
commented to ${blogId} with ${dbResponse.lastID}
```

## Delete a specific comment

#### Endpoint : ```/blogs/comments/:commentId```
#### method: **DELETE**
#### Response:
```
Comment deleted successfully
```