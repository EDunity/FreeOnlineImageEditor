const Express = require("express");
const Http = require("http");
const Path = require("path");
const SocketIO = require("socket.io");

const App = Express();
const Server = Http.Server(App);
const IO = SocketIO(Server);

const FrameRate = 60;

class User {
    constructor(_ID) {
        this.ID = _ID;
        this.UserName = null;
        this.RoomName = null;
        this.MouseX = null;
        this.MouseY = null;
        this.R = null;
        this.G = null;
        this.B = null;
        this.A = null;
    }
}
class Room {
    constructor(_Name, _Password) {
        this.Name = _Name;
        this.Password = _Password;
        this.IDs = [];
    }
}

const Port = process.env.PORT || 3000;

const Users = {};
const Rooms = {};

IO.on("connection", function (_Socket) {
    _Socket.on("Setup", function () {
        Users[_Socket.id] = new User(_Socket.id);

        IO.to(_Socket.id).emit("ID", _Socket.id);
    });

    _Socket.on("Set_Mouse", function (_MouseX, _MouseY) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                Users[_Socket.id].MouseX = _MouseX;
                Users[_Socket.id].MouseY = _MouseY;

                IO.to(Users[_Socket.id].RoomName).emit("Users", Users);
            }
        }
    });
    _Socket.on("Set_Color", function (_R, _G, _B, _A) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                Users[_Socket.id].R = _R;
                Users[_Socket.id].G = _G;
                Users[_Socket.id].B = _B;
                Users[_Socket.id].A = _A;

                IO.to(Users[_Socket.id].RoomName).emit("Users", Users);
            }
        }
    });

    _Socket.on("Create_Room", function (_RoomName, _RoomPassword, _UserName) {
        if (_Socket.id in Users) {
            if (!(_RoomName in Rooms)) {
                {
                    const RoomName = Users[_Socket.id].RoomName;

                    if (RoomName != null) {
                        Users[_Socket.id].RoomName = null;

                        Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(_Socket.id), 1);

                        if (Rooms[RoomName].IDs == 0) {
                            delete Rooms[RoomName];
                        }

                        _Socket.leave(RoomName);

                        IO.to(RoomName).emit("Users", Users);
                        IO.to(RoomName).emit("Rooms", Rooms);
                    }
                }

                {
                    Users[_Socket.id].UserName = _UserName;
                    Users[_Socket.id].RoomName = _RoomName;

                    Rooms[_RoomName] = new Room(_RoomName, _RoomPassword);
                    Rooms[_RoomName].IDs.push(_Socket.id);

                    _Socket.join(_RoomName);

                    IO.to(_RoomName).emit("Users", Users);
                    IO.to(_RoomName).emit("Rooms", Rooms);
                }

                IO.to(_Socket.id).emit("Create_Room");

                IO.to(_Socket.id).emit("Alert", "Room has been created.");
            }
            else {
                IO.to(_Socket.id).emit("Alert", "Room already exists.");
            }
        }
    });
    _Socket.on("Join_Room", function (_RoomName, _RoomPassword, _UserName) {
        if (_Socket.id in Users) {
            if (_RoomName in Rooms) {
                if (Rooms[_RoomName].Password == _RoomPassword) {
                    {
                        const RoomName = Users[_Socket.id].RoomName;

                        if (RoomName != null) {
                            Users[_Socket.id].RoomName = null;

                            Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(_Socket.id), 1);

                            if (Rooms[RoomName].IDs == 0) {
                                delete Rooms[RoomName];
                            }

                            _Socket.leave(RoomName);

                            IO.to(RoomName).emit("Users", Users);
                            IO.to(RoomName).emit("Rooms", Rooms);
                        }
                    }

                    {
                        Users[_Socket.id].UserName = _UserName;
                        Users[_Socket.id].RoomName = _RoomName;

                        Rooms[_RoomName].IDs.push(_Socket.id);

                        _Socket.join(_RoomName);

                        IO.to(_RoomName).emit("Users", Users);
                        IO.to(_RoomName).emit("Rooms", Rooms);
                    }

                    IO.to(_Socket.id).emit("Join_Room");

                    IO.to(_Socket.id).emit("Alert", "You have joined Room.");
                }
                else {
                    IO.to(_Socket.id).emit("Alert", "Password is wrong.");
                }
            }
            else {
                IO.to(_Socket.id).emit("Alert", "Room does not exist.");
            }
        }
    });
    _Socket.on("Leave_Room", function () {
        if (_Socket.id in Users) {
            const RoomName = Users[_Socket.id].RoomName;

            if (RoomName in Rooms) {
                Users[_Socket.id].RoomName = null;

                Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(_Socket.id), 1);

                if (Rooms[RoomName].IDs == 0) {
                    delete Rooms[RoomName];
                }

                _Socket.leave(RoomName);

                IO.to(RoomName).emit("Users", Users);
                IO.to(RoomName).emit("Rooms", Rooms);

                IO.to(_Socket.id).emit("Alert", "You have left Room.");
            }
            else {
                IO.to(_Socket.id).emit("Alert", "You have not joined Room.");
            }
        }
    });

    _Socket.on("Create_Image", function (_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                for (let i = 0; i < Rooms[Users[_Socket.id].RoomName].IDs.length; i++) {
                    if (Rooms[Users[_Socket.id].RoomName].IDs[i] == _Socket.id) {
                        continue;
                    }

                    IO.to(Rooms[Users[_Socket.id].RoomName].IDs[i]).emit("Create_Image", _PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D);
                }
            }
        }
    });
    _Socket.on("Update_Image", function (_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                for (let i = 0; i < Rooms[Users[_Socket.id].RoomName].IDs.length; i++) {
                    if (Rooms[Users[_Socket.id].RoomName].IDs[i] == _Socket.id) {
                        continue;
                    }

                    IO.to(Rooms[Users[_Socket.id].RoomName].IDs[i]).emit("Update_Image", _PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D);
                }
            }
        }
    });
    _Socket.on("Undo_Image", function (_PhotoName) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                for (let i = 0; i < Rooms[Users[_Socket.id].RoomName].IDs.length; i++) {
                    if (Rooms[Users[_Socket.id].RoomName].IDs[i] == _Socket.id) {
                        continue;
                    }

                    IO.to(Rooms[Users[_Socket.id].RoomName].IDs[i]).emit("Undo_Image", _PhotoName);
                }
            }
        }
    });
    _Socket.on("Redo_Image", function (_PhotoName) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                for (let i = 0; i < Rooms[Users[_Socket.id].RoomName].IDs.length; i++) {
                    if (Rooms[Users[_Socket.id].RoomName].IDs[i] == _Socket.id) {
                        continue;
                    }

                    IO.to(Rooms[Users[_Socket.id].RoomName].IDs[i]).emit("Redo_Image", _PhotoName);
                }
            }
        }
    });
    _Socket.on("Remove_Image", function (_PhotoName) {
        if (_Socket.id in Users) {
            if (Users[_Socket.id].RoomName != null) {
                for (let i = 0; i < Rooms[Users[_Socket.id].RoomName].IDs.length; i++) {
                    if (Rooms[Users[_Socket.id].RoomName].IDs[i] == _Socket.id) {
                        continue;
                    }

                    IO.to(Rooms[Users[_Socket.id].RoomName].IDs[i]).emit("Remove_Image", _PhotoName);
                }
            }
        }
    });

    _Socket.on("disconnect", () => {
        if (_Socket.id in Users) {
            const RoomName = Users[_Socket.id].RoomName;

            if (RoomName in Rooms) {
                Users[_Socket.id].RoomName = null;

                Rooms[RoomName].IDs.splice(Rooms[RoomName].IDs.indexOf(_Socket.id), 1);

                if (Rooms[RoomName].IDs == 0) {
                    delete Rooms[RoomName];
                }

                _Socket.leave(RoomName);
            }

            delete Users[_Socket.id];

            IO.to(RoomName).emit("Users", Users);
            IO.to(RoomName).emit("Rooms", Rooms);
        }
    });
});

setInterval(function () {
}, 1000 / FrameRate);

App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => {
    _Response.sendFile(Path.join(__dirname, "/public/Japanese/index.html"));
});

Server.listen(Port, function () {
    console.log("Starting Server on port " + Port + ".");
});