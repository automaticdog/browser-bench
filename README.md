# browser-bench

## Running all tests for a given role(s)

request body should be formatted like this:

```
{
    "env": "staging",
    "roles": ["viewer", "admin"]
}
```

## Running Custom Tests

request body should be formatted like this:

```
{
    "user": "user@realpage.com",
    "password": "mycoolpw123",
    "urls": ["https://content-management-system-content-staging.g5devops.com/"]
}
```