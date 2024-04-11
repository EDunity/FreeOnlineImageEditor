const Express = require("express");
const Http = require("http");
const Path = require("path");
const SocketIO = require("socket.io");

const App = Express();
const Server = Http.Server(App);
const IO = SocketIO(Server);

class User
{
    constructor(_ID)
    {
        this.ID = _ID;
        this.RoomName = null;
        this.MouseX = null;
        this.MouseY = null;
    }
}
class Room
{
    constructor(_Name, _Password, _PhotoEditors, _Pallets, _PaintTools)
    {
        this.Name = _Name;
        this.Password = _Password;
        this.IDs = [];
        this.PhotoEditors = _PhotoEditors;
        this.Pallets = _Pallets;
        this.PaintTools = _PaintTools;
    }
}

const Port = process.env.PORT || 3000;

const Users = {};
const Rooms = {};

IO.on("connection", function(_Socket) 
{
    let User_ = null;

    _Socket.on("Setup", function() 
    {
        User_ = new User(_Socket.id);

        Users[User_.ID] = User_;

        IO.to(User_.ID).emit("ID", User_.ID);
    });

    _Socket.on("Mouse", function(_MouseX, _MouseY) 
    {
        if(User_ != null)
        {
            if(Users[User_.ID].RoomName != null)
            {
                if(Rooms[Users[User_.ID].RoomName].IDs.length > 0)
                {
                    Users[User_.ID].MouseX = _MouseX;
                    Users[User_.ID].MouseY = _MouseY;
        
                    IO.to(Users[User_.ID].RoomName).emit("Users", Users);
                }
            }
        }
    });

    _Socket.on("Create_Room", function(_RoomName, _RoomPassword) 
    {
        if(User_ != null)
        {
            if(!(_RoomName in Rooms))
            {
                Users[User_.ID].RoomName = _RoomName;

                Rooms[_RoomName] = new Room(_RoomName, _RoomPassword);
                Rooms[_RoomName].IDs.push(User_.ID);
    
                _Socket.join(_RoomName);

                IO.to(_RoomName).emit("Users", Users);
                IO.to(_RoomName).emit("Rooms", Rooms);

                IO.to(User_.ID).emit("Alert", "Room has been created.");
            }
            else
            {
                IO.to(User_.ID).emit("Alert", "Room already exists.");
            }
        }
    });

    _Socket.on("Join_Room", function(_RoomName, _RoomPassword) 
    {
        if(User_ != null)
        {
            if(_RoomName in Rooms)
            {
                if(Rooms[_RoomName].Password == _RoomPassword)
                {
                    Users[User_.ID].RoomName = _RoomName;

                    Rooms[_RoomName].IDs.push(User_.ID);
    
                    _Socket.join(_RoomName);

                    IO.to(_RoomName).emit("Users", Users);
                    IO.to(_RoomName).emit("Rooms", Rooms);

                    IO.to(User_.ID).emit("Alert", "You have joined Room.");
                }
                else
                {
                    IO.to(User_.ID).emit("Alert", "Password is wrong.");
                }
            }
            else
            {
                IO.to(User_.ID).emit("Alert", "Room does not exist.");
            }
        }
    });

    _Socket.on("Leave_Room", function() 
    {
        if(User_ != null)
        {
            const RoomName = Users[User_.ID].RoomName;

            if(RoomName in Rooms)
            {
                Users[User_.ID].RoomName = null;

                Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(User_.ID), 1);

                if(Rooms[RoomName].IDs == 0)
                {
                    delete Rooms[RoomName];
                }

                _Socket.leave(RoomName);

                IO.to(RoomName).emit("Users", Users);
                IO.to(RoomName).emit("Rooms", Rooms);

                IO.to(User_.ID).emit("Alert", "You have left Room.");
            }
            else
            {
                IO.to(User_.ID).emit("Alert", "You have not joined Room.");
            }
        }
    });
    
    _Socket.on("disconnect", () =>
    {
        if(User_ != null)
        {
            const RoomName = Users[User_.ID].RoomName;

            if(RoomName in Rooms)
            {
                Users[User_.ID].RoomName = null;

                Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(User_.ID), 1);

                if(Rooms[RoomName].IDs == 0)
                {
                    delete Rooms[RoomName];
                }

                _Socket.leave(RoomName);
            }

            delete Users[User_.ID];

            User_ = null;

            IO.to(RoomName).emit("Users", Users);
            IO.to(RoomName).emit("Rooms", Rooms);
        }
    });
});

setInterval(function() 
{
}, 1000 / 60);

App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => 
{
    _Response.sendFile(Path.join(__dirname, "/public/Japanese/index.html"));
});

Server.listen(Port, function() 
{
    console.log("Starting Server on port " + Port + ".");
});