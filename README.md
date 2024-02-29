## Endpoints

base url : https://media-nv-backend-assignment.onrender.com/

<code>
    const options = {
        method: [api method],
        headers: {
            Authorization: "Bearer jwt_key"
        }
        body: JSON.strigify(data)
    }
</code>

| endpoint  | method | body                              |
| --------- | ------ | --------------------------------- |
| /register | POST   | *{username, password, displayName}* |
| /login    | POST   | *{username, password}*              |
