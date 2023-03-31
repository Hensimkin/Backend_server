import express from 'express'

const port = process.env.PORT || 3000;
const app=express();

app.get('/',(req,res)=>{
    console.log("a new request");
    res.send("hello from server main page");
}
);


app.listen(port,()=>{
    console.log("server is running on port:"+port);
});