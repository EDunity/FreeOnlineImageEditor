class PngFile {
    constructor(_Src) {
        this.Src = _Src;
        this.Width;
        this.Height;
        this.Data1D;

        const This = this;

        const Image_ = new Image();
        Image_.src = this.Src;
        Image_.crossOrigin = "Anonymous";
        Image_.onload = function () {
            const Canvas = document.createElement("canvas");
            Canvas.width = Image_.width;
            Canvas.height = Image_.height;

            const Context = Canvas.getContext("2d");

            Context.drawImage(Image_, 0, 0);

            const ImageData = Context.getImageData(0, 0, Image_.width, Image_.height);

            const Data1D_Photo = ImageData.data;

            This.Width = Image_.width;
            This.Height = Image_.height;
            This.Data1D = Data1D_Photo;
        };
    }
}
class Mathf {
    static Clamp(_Value, _MinValue, _MaxValue) {
        return Math.min(Math.max(_Value, _MinValue), _MaxValue);
    }

    static Clamp01(_Value) {
        if (_Value < 0) {
            return 0;
        }
        else if (_Value > 1) {
            return 1;
        }
        else {
            return _Value;
        }
    }

    static Lerp(_Value1, _Value2, _Ratio) {
        return _Value1 + (_Value2 - _Value1) * Mathf.Clamp01(_Ratio);
    }

    static Dist(_StartPosX, _StartPosY, _EndPosX, _EndPosY) {
        return Math.sqrt(Math.pow((_EndPosX - _StartPosX), 2) + Math.pow((_EndPosY - _StartPosY), 2));
    }

    static SquaredDist(_StartPosX, _StartPosY, _EndPosX, _EndPosY) {
        return Math.pow((_EndPosX - _StartPosX), 2) + Math.pow((_EndPosY - _StartPosY), 2);
    }
}
class Vector2Int {
    constructor(_X, _Y) {
        this.X = _X;
        this.Y = _Y;
    }

    Copy() {
        return new Vector2Int(this.X, this.Y);
    }

    IsEqual(_Vector2Int) {
        return this.X == _Vector2Int.X && this.Y == _Vector2Int.Y;
    }

    ToString() {
        return "(" + this.X + ", " + this.Y + ")";
    }
}
class Color {
    constructor(_R, _G, _B, _A) {
        this.R = Mathf.Clamp(_R, 0, 255);
        this.G = Mathf.Clamp(_G, 0, 255);
        this.B = Mathf.Clamp(_B, 0, 255);
        this.A = Mathf.Clamp(_A, 0, 255);
    }

    Blend(_Color, _Ratio) {
        return new Color(
            Mathf.Lerp(this.R, _Color.R, _Ratio),
            Mathf.Lerp(this.G, _Color.G, _Ratio),
            Mathf.Lerp(this.B, _Color.B, _Ratio),
            Mathf.Lerp(this.A, _Color.A, _Ratio),
            // this.A
        );
    }
    Red() {
        return new Color(this.R, 0, 0, 255);
    }
    Green() {
        return new Color(0, this.G, 0, 255);
    }
    Blue() {
        return new Color(0, 0, this.B, 255);
    }
    Grayscale() {
        const Grayscale = 0.299 * this.R + 0.587 * this.G + 0.114 * this.B;
        // const Grayscale = (this.R + this.G + this.B) / 3;

        return new Color(Grayscale, Grayscale, Grayscale, 255);
    }
    Invert() {
        return new Color(abs(this.R - 255), abs(this.G - 255), abs(this.B - 255), 255);
    }
    Posterize(_Level) {
        const Tone = (255 / _Level);

        return new Color(
            floor(this.R / Tone) * Tone,
            floor(this.G / Tone) * Tone,
            floor(this.B / Tone) * Tone,
            255
        );
    }
    Copy() {
        return new Color(this.R, this.G, this.B, this.A);
    }

    ToColorP5js() {
        return [this.R, this.G, this.B, this.A];
    }
    ToColorHex() {
        let R = this.R.toString(16);
        if (R.length == 1) {
            R = "0" + R;
        }

        let G = this.G.toString(16);
        if (G.length == 1) {
            G = "0" + G;
        }

        let B = this.B.toString(16);
        if (B.length == 1) {
            B = "0" + B;
        }

        let A = this.A.toString(16);
        if (A.length == 1) {
            A = "0" + A;
        }

        const Hex = "#" + R + G + B + A;

        return Hex;
    }

    IsEqual(_Color) {
        return this.R == _Color.R && this.G == _Color.G && this.B == _Color.B && this.A == _Color.A;
    }

    ToString() {
        return "(" + this.R + ", " + this.G + ", " + this.B + ", " + this.A + ")";
    }
}
class Photo {
    constructor(_Name, _Type, _Width, _Height, _Data1D) {
        this.Name = _Name;
        this.Type = _Type;
        this.Width = _Width;
        this.Height = _Height;
        this.Data1D = _Data1D;
        if (this.HasData()) {
            this.Update();
        }
    }

    Update() {
        if (this.Graphic != null) this.Graphic.remove();
        this.Graphic = createGraphics(this.Width, this.Height);
        this.Graphic.loadPixels();
        this.Graphic.pixels.set(this.Data1D);
        this.Graphic.updatePixels();
    }

    Get(_IndexX, _IndexY) {
        const Index = (this.Width * _IndexY + _IndexX) * 4;

        const R = this.Data1D[Index + 0];
        const G = this.Data1D[Index + 1];
        const B = this.Data1D[Index + 2];
        const A = this.Data1D[Index + 3];

        const Color_ = new Color(R, G, B, A);

        return Color_;
    }
    Set(_Index2s, _Color) {
        _Index2s = _Index2s.filter(function (Item1, i, Array) {
            return Array.findIndex(function (Item2) {
                return Item1.IsEqual(Item2);
            }) === i
        });

        for (let i = 0; i < _Index2s.length; i++) {
            const Index2 = _Index2s[i];

            if (!this.IndexIsOnPhoto(Index2.X, Index2.Y)) {
                continue;
            }

            const Index = (this.Width * Index2.Y + Index2.X) * 4;

            this.Data1D[Index + 0] = _Color.R;
            this.Data1D[Index + 1] = _Color.G;
            this.Data1D[Index + 2] = _Color.B;
            this.Data1D[Index + 3] = _Color.A;

            this.Graphic.pixels[Index + 0] = _Color.R;
            this.Graphic.pixels[Index + 1] = _Color.G;
            this.Graphic.pixels[Index + 2] = _Color.B;
            this.Graphic.pixels[Index + 3] = _Color.A;
        }

        this.Graphic.updatePixels();
    }
    GradatedSet(_Index2s, _CenterIndexX, _CenterIndexY, _Radius, _Level, _Color) {
        _Index2s = _Index2s.filter(function (Item1, i, Array) {
            return Array.findIndex(function (Item2) {
                return Item1.IsEqual(Item2);
            }) === i
        });

        for (let i = 0; i < _Index2s.length; i++) {
            const Index2 = _Index2s[i];

            if (!this.IndexIsOnPhoto(Index2.X, Index2.Y)) {
                continue;
            }

            let Dist = Mathf.Dist(_CenterIndexX, _CenterIndexY, Index2.X, Index2.Y);
            Dist = Mathf.Clamp(Dist, 0, _Radius);

            const Tone = floor(Dist / ((_Radius / _Level) + 0.01));

            let Ratio = map(Tone, 0, _Level, 0, 1);
            Ratio = Mathf.Clamp01(Ratio);

            const Color_ = _Color.Blend(this.Get(Index2.X, Index2.Y), Ratio);

            this.Set([Index2], Color_);
        }
    }
    Fill(_IndexX, _IndexY, _Color) {
        if (!this.IndexIsOnPhoto(_IndexX, _IndexY)) {
            return;
        }

        const Color_ = this.Get(_IndexX, _IndexY);

        if (_Color.IsEqual(Color_)) {
            return;
        }

        let Index2s = [];

        this.Set([new Vector2Int(_IndexX, _IndexY)], _Color);
        Index2s.push(new Vector2Int(_IndexX, _IndexY));

        while (true) {
            let Index2s_ = [];

            for (let i = 0; i < Index2s.length; i++) {
                for (let j = -1; j <= 1; j++) {
                    for (let k = -1; k <= 1; k++) {
                        if (j == 0 && k == 0 || j * k != 0) {
                            continue;
                        }

                        const IndexX = Index2s[i].X + j;
                        const IndexY = Index2s[i].Y + k;

                        if (!this.IndexIsOnPhoto(IndexX, IndexY)) {
                            continue;
                        }

                        if (this.Get(IndexX, IndexY).IsEqual(Color_)) {
                            this.Set([new Vector2Int(IndexX, IndexY)], _Color);
                            Index2s_.push(new Vector2Int(IndexX, IndexY));
                        }
                    }
                }
            }

            Index2s = Index2s_;

            if (Index2s_.length == 0) {
                break;
            }
        }
    }
    SelectedFill(_MinIndexX, _MinIndexY, _MaxIndexX, _MaxIndexY, _Color) {
        for (let i = _MinIndexX; i <= _MaxIndexX; i++) {
            for (let j = _MinIndexY; j <= _MaxIndexY; j++) {
                if (this.IndexIsOnPhoto(i, j)) {
                    this.Set([new Vector2Int(i, j)], _Color);
                }
            }
        }
    }

    Red() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Red();
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Green() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Green();
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Blue() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Blue();
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Grayscale() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Grayscale();
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Binary(_Threshold) {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                if (Data2D_Photo[i][j].R < _Threshold) {
                    Data2D_Photo_[i][j] = new Color(0, 0, 0, 255);
                }
                else {
                    Data2D_Photo_[i][j] = new Color(255, 255, 255, 255);
                }
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Invert() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Invert();
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Blur(_Size) {
        const Index = (_Size - 1) * 0.5;

        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                let Count = 0;

                let R = 0;
                let G = 0;
                let B = 0;
                let A = Data2D_Photo[i][j].A;

                for (let k = -Index; k <= Index; k++) {
                    for (let l = -Index; l <= Index; l++) {
                        const IndexX = i + k;
                        const IndexY = j + l;

                        if (IndexX < 0 || this.Width - 1 < IndexX || IndexY < 0 || this.Height - 1 < IndexY) {
                            continue;
                        }

                        Count += 1;

                        R += Data2D_Photo[IndexX][IndexY].R;
                        G += Data2D_Photo[IndexX][IndexY].G;
                        B += Data2D_Photo[IndexX][IndexY].B;
                    }
                }

                R = floor(R / Count);
                G = floor(G / Count);
                B = floor(B / Count);

                Data2D_Photo_[i][j] = new Color(R, G, B, A);
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Posterize(_Level) {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[i][j] = Data2D_Photo[i][j].Posterize(_Level);
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Edge() {
        const KernelX =
            [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1],
            ];

        const KernelY =
            [
                [1, 2, 1],
                [0, 0, 0],
                [-1, -2, -1],
            ];

        const Index = (KernelX.length - 1) * 0.5;

        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                let IsEdge = false;

                let SumX = 0;
                let SumY = 0;

                let R = floor(0);
                let G = floor(0);
                let B = floor(0);
                let A = floor(Data2D_Photo[i][j].A);

                for (let k = -Index; k <= Index; k++) {
                    for (let l = -Index; l <= Index; l++) {
                        const IndexX = i + k;
                        const IndexY = j + l;

                        if (IndexX < 0 || this.Width - 1 < IndexX || IndexY < 0 || this.Height - 1 < IndexY) {
                            IsEdge = true;

                            break;
                        }

                        SumX += Data2D_Photo[IndexX][IndexY].R * KernelX[k + Index][l + Index];
                        SumY += Data2D_Photo[IndexX][IndexY].R * KernelY[k + Index][l + Index];
                    }

                    if (IsEdge) {
                        break;
                    }
                }

                if (IsEdge) {
                    R = floor(0);
                    G = floor(0);
                    B = floor(0);
                }
                else {
                    const Strength = Math.sqrt(SumX * SumX + SumY * SumY);

                    R = floor(Strength);
                    G = floor(Strength);
                    B = floor(Strength);
                }

                Data2D_Photo_[i][j] = new Color(R, G, B, A);
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Thin() {
        const Kernels = [
            //
            [
                [0, 0, -1],
                [0, 1, 1],
                [-1, 1, 1],
            ],
            [
                [0, -1, 1],
                [0, 1, 1],
                [0, -1, 1],
            ],
            [
                [0, 0, 0],
                [-1, 1, -1],
                [1, 1, 1],
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 0, 0],
                [0, 1, 0],
                [0, 1, 1],
            ],
            //
            [
                [1, 1, -1],
                [1, 1, 0],
                [-1, 0, 0],
            ],
            [
                [1, 1, 1],
                [-1, 1, -1],
                [0, 0, 0],
            ],
            [
                [1, -1, 0],
                [1, 1, 0],
                [1, -1, 0],
            ],
            //
            [
                [-1, 0, 0],
                [1, 1, 0],
                [1, 1, -1],
            ],
            [
                [0, 0, 0],
                [-1, 1, -1],
                [1, 1, 1],
            ],
            [
                [1, -1, 0],
                [1, 1, 0],
                [1, -1, 0],
            ],
            [
                [0, 0, 0],
                [0, 1, 0],
                [1, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [1, 0, 0],
            ],
            //
            [
                [-1, 1, 1],
                [0, 1, 1],
                [0, 0, -1],
            ],
            [
                [0, -1, 1],
                [0, 1, 1],
                [0, -1, 1],
            ],
            [
                [1, 1, 1],
                [-1, 1, -1],
                [0, 0, 0],
            ],
        ];

        const Index = (Kernels[0].length - 1) * 0.5;

        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = ToData2D(this.Width, this.Height, this.Data1D);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                let IsEdge = false;

                let R = floor(0);
                let G = floor(0);
                let B = floor(0);
                let A = floor(Data2D_Photo[i][j].A);

                if (Data2D_Photo[i][j].R == 0) {
                    R = floor(0);
                    G = floor(0);
                    B = floor(0);
                }
                else if (Data2D_Photo[i][j].R == 255) {
                    let CanThin = false;

                    for (let m = 0; m < Kernels.length; m++) {
                        let Count = 0;

                        for (let k = -Index; k <= Index; k++) {
                            for (let l = -Index; l <= Index; l++) {
                                const IndexX = i + k;
                                const IndexY = j + l;

                                if (IndexX < 0 || this.Width - 1 < IndexX || IndexY < 0 || this.Height - 1 < IndexY) {
                                    IsEdge = true;

                                    break;
                                }

                                if (Kernels[m][k + Index][l + Index] == -1 || Kernels[m][k + Index][l + Index] * 255 == Data2D_Photo[IndexX][IndexY].R) {
                                    Count += 1;
                                }
                            }

                            if (IsEdge) {
                                break;
                            }
                        }

                        if (IsEdge) {
                            break;
                        }

                        if (Count == 9) {
                            CanThin = true;

                            break;
                        }
                    }

                    if (CanThin) {
                        R = floor(0);
                        G = floor(0);
                        B = floor(0);
                    }
                    else {
                        R = floor(255);
                        G = floor(255);
                        B = floor(255);
                    }
                }

                Data2D_Photo_[i][j] = new Color(R, G, B, A);
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    RotateRight() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = CreateFilledArray2D(this.Height, this.Width, undefined);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[this.Height - 1 - j][i] = Data2D_Photo[i][j];
            }
        }

        const Data1D_Photo = ToData1D(this.Height, this.Width, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Height, this.Width, Data1D_Photo);
    }
    RotateLeft() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = CreateFilledArray2D(this.Height, this.Width, undefined);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                Data2D_Photo_[j][this.Width - 1 - i] = Data2D_Photo[i][j];
            }
        }

        const Data1D_Photo = ToData1D(this.Height, this.Width, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Height, this.Width, Data1D_Photo);
    }
    FlipHorizontally() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = Data2D_Photo.reverse();

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    FlipVertically() {
        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = Data2D_Photo.map(row => [...row].reverse());

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Resize(_Width, _Height) {
        const RatioX = this.Width / _Width;
        const RatioY = this.Height / _Height;

        const Data2D_Photo = ToData2D(this.Width, this.Height, this.Data1D);

        const Data2D_Photo_ = CreateFilledArray2D(_Width, _Height, undefined);
        for (let i = 0; i < _Width; i++) {
            for (let j = 0; j < _Height; j++) {
                const IndexX = Math.floor(i * RatioX);
                const IndexY = Math.floor(j * RatioY);

                Data2D_Photo_[i][j] = Data2D_Photo[IndexX][IndexY];
            }
        }

        const Data1D_Photo = ToData1D(_Width, _Height, Data2D_Photo_);

        return new Photo(this.Name, this.Type, _Width, _Height, Data1D_Photo);
    }
    Place(_Photo, _IndexX, _IndexY) {
        const Data1D_Photo = CopyPrimitiveArray1D(this.Data1D);

        for (let i = 0; i < _Photo.Width; i++) {
            for (let j = 0; j < _Photo.Height; j++) {
                const IndexX = i + _IndexX;
                const IndexY = j + _IndexY;

                if (!this.IndexIsOnPhoto(IndexX, IndexY)) {
                    continue;
                }

                const Index1 = (this.Width * IndexY + IndexX) * 4;

                const Index2 = (_Photo.Width * j + i) * 4;

                Data1D_Photo[Index1 + 0] = _Photo.Data1D[Index2 + 0];
                Data1D_Photo[Index1 + 1] = _Photo.Data1D[Index2 + 1];
                Data1D_Photo[Index1 + 2] = _Photo.Data1D[Index2 + 2];
                Data1D_Photo[Index1 + 3] = _Photo.Data1D[Index2 + 3];
            }
        }

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Crop(_MinIndexX, _MinIndexY, _MaxIndexX, _MaxIndexY) {
        const Width_Photo = _MaxIndexX - _MinIndexX + 1;

        const Height_Photo = _MaxIndexY - _MinIndexY + 1;

        const Data1D_Photo = [];
        for (let i = _MinIndexY; i <= _MaxIndexY; i++) {
            for (let j = _MinIndexX; j <= _MaxIndexX; j++) {
                if (this.IndexIsOnPhoto(i, j)) {
                    const Index = (this.Width * i + j) * 4;

                    Data1D_Photo.push(this.Data1D[Index + 0]);
                    Data1D_Photo.push(this.Data1D[Index + 1]);
                    Data1D_Photo.push(this.Data1D[Index + 2]);
                    Data1D_Photo.push(this.Data1D[Index + 3]);
                }
                else {
                    Data1D_Photo.push(255);
                    Data1D_Photo.push(255);
                    Data1D_Photo.push(255);
                    Data1D_Photo.push(0);
                }
            }
        }

        return new Photo(this.Name, this.Type, Width_Photo, Height_Photo, Data1D_Photo);
    }
    Background() {
        const Data2D_Photo = CreateFilledArray2D(this.Width, this.Height, undefined);
        for (let i = 0; i < this.Width; i++) {
            for (let j = 0; j < this.Height; j++) {
                if (Math.floor(i / Width_CheckerPattern) % 2 == Math.floor(j / Width_CheckerPattern) % 2) {
                    Data2D_Photo[i][j] = new Color(255, 255, 255, 255);
                }
                else {
                    Data2D_Photo[i][j] = new Color(127, 127, 127, 255);
                }
            }
        }

        const Data1D_Photo = ToData1D(this.Width, this.Height, Data2D_Photo);

        return new Photo(this.Name, this.Type, this.Width, this.Height, Data1D_Photo);
    }
    Copy() {
        return new Photo(this.Name, this.Type, this.Width, this.Height, CopyPrimitiveArray1D(this.Data1D));
    }
    static get Empty() {
        return new Photo("Empty", "image/png", 0, 0, []);
    }
    static get Untitled() {
        return new Photo("Untitled", "image/png", PngFile_Untitled.Width, PngFile_Untitled.Height, PngFile_Untitled.Data1D);
    }

    HasData() {
        return this.Data1D.length > 0;
    }
    IndexIsOnPhoto(_IndexX, _IndexY) {
        return -1 < _IndexX && _IndexX < this.Width && -1 < _IndexY && _IndexY < this.Height;
    }
}
class PaintTool {
    constructor(_PaintToolID, _Name, _Diameter) {
        this.PaintToolID = _PaintToolID;
        this.Name = _Name;
        this.Diameter = _Diameter;
        this.Radius = (this.Diameter - 1) * 0.5;
        this.Photo = Photo.Empty;
        this.Index2s = [];
        this.Pos2s = [];
    }
}
class UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color) {
        this.CornerPosX = _CornerPosX;
        this.CornerPosY = _CornerPosY;
        this.Width = _Width;
        this.Height = _Height;
        this.Color = _Color;
        this.IsVisible = true;
        this.IsAvailable = true;
        this.IsBeingRightPressed = false;
        this.IsBeingRightDragged = false;
        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
        this.IsBeingCenterPressed = false;
        this.IsBeingCenterDragged = false;
        if (this.Graphic != null) this.Graphic.remove();
        this.Graphic = createGraphics(this.Width - 1, this.Height - 1);
        this.UIs = [];
    }

    Draw() {
    }
    IsRightPressed() {
    }
    IsRightDragged() {
    }
    IsRightReleased() {
    }
    IsLeftPressed() {
    }
    IsLeftDragged() {
    }
    IsLeftReleased() {
    }
    IsCenterPressed() {
    }
    IsCenterDragged() {
    }
    IsCenterReleased() {
    }
    MouseScrolled(_Event) {
    }
    KeyPressed(_Key) {
    }
    KeyReleased(_Key) {
    }
    MouseOut() {
        this.IsBeingRightPressed = false;
        this.IsBeingRightDragged = false;
        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
        this.IsBeingCenterPressed = false;
        this.IsBeingCenterDragged = false;

        this.IsRightReleased();
        this.IsLeftReleased();
        this.IsCenterReleased();
    }
    MouseOver() {
    }
    PushUI(_Index, _UIs) {
        if (arguments.length == 1) {
            while (UIs.length <= _Index) {
                UIs.push([]);
            }

            UIs[_Index].push(this);

            this.PushUI(_Index, this.UIs);
        }
        else if (arguments.length == 2) {
            _UIs.forEach(Item => {
                Item.PushUI(_Index);
            });
        }
    }
    SetIsVisible(_Value, _UIs) {
        if (arguments.length == 1) {
            this.IsVisible = _Value;

            this.SetIsVisible(_Value, this.UIs);
        }
        else if (arguments.length == 2) {
            _UIs.forEach(Item => {
                Item.SetIsVisible(_Value);
            });
        }
    }
    SetIsAvailable(_Value, _UIs) {
        if (arguments.length == 1) {
            this.IsAvailable = _Value;

            this.SetIsAvailable(_Value, this.UIs);
        }
        else if (arguments.length == 2) {
            _UIs.forEach(Item => {
                Item.SetIsAvailable(_Value);
            });
        }
    }

    MouseIsOnUI() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        return this.CornerPosX - 1 < mouseX && mouseX < this.CornerPosX + this.Width && this.CornerPosY - 1 < mouseY && mouseY < this.CornerPosY + this.Height;
    }
}
class Label extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Text, _TextSize) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Text = _Text;
        this.TextSize = _TextSize;
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //Label
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            //Text
            {
                if (this.TextSize > 0) {
                    this.Graphic.fill(Color_Text.ToColorP5js());
                    this.Graphic.noStroke();
                    this.Graphic.textAlign("center", "center");
                    this.Graphic.textSize(this.TextSize);
                    this.Graphic.text(this.Text, this.Width * 0.5, this.Height * 0.5);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
}
class InputField extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Text, _TextSize, _TextType, _ENTER) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Text = _Text;
        this.TextSize = _TextSize;
        this.TextType = _TextType;
        this.ENTER = _ENTER;
        this.IsFocused = false;
        this.StartIndexX = 0;
        this.EndIndexX = 0;
        this.LastKey = "";
        this.KeyMillis = 0;
        this.KeyStates = {};
        this.CursorHeight = this.Height * 0.5;
        this.CursorMillis = 0;
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //InputField
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            //Text
            {
                if (this.TextSize > 0) {
                    this.Graphic.fill(Color_Text.ToColorP5js());
                    this.Graphic.noStroke();
                    this.Graphic.textAlign("left", "center");
                    this.Graphic.textSize(this.TextSize);
                    this.Graphic.text(this.Text, Space_Text, this.Height * 0.5);
                }
            }

            //Cursor
            {
                if (this.IsFocused) {
                    if (this.StartIndexX == this.EndIndexX) {
                        if (((millis() - this.CursorMillis) * 0.001) % 0.5 <= 0.25) {
                            const StartPosX = this.PosX_(this.StartIndexX);

                            this.Graphic.fill(0, 0, 0, 255);
                            this.Graphic.noStroke();
                            this.Graphic.rect(
                                StartPosX,
                                (this.Height - this.CursorHeight) * 0.5,
                                1,
                                this.CursorHeight
                            );
                        }
                    }
                    else {
                        const StartPosX = this.PosX_(this.StartIndexX);
                        const EndPosX = this.PosX_(this.EndIndexX);

                        this.Graphic.fill(Color_Select.ToColorP5js());
                        this.Graphic.noStroke();
                        this.Graphic.rect(
                            StartPosX,
                            (this.Height - this.CursorHeight) * 0.5,
                            EndPosX - StartPosX,
                            this.CursorHeight
                        );
                    }
                }
            }

            //Edge
            {
                this.Graphic.noFill();
                this.Graphic.stroke((this.IsFocused ? Color_DarkBlue : Color_White).ToColorP5js());
                this.Graphic.strokeWeight(2);
                this.Graphic.rect(0, 0, this.Width - 1, this.Height - 1);
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }

        if (this.IsFocused && millis() >= this.KeyMillis) {
            if (this.KeyStates["Control"]) {
                if (this.KeyStates["v"]) {
                    this.Delete2(this.StartIndexX, this.EndIndexX);

                    this.Paste(this.StartIndexX);
                }
            }
            else if (this.KeyStates["Backspace"]) {
                if (this.StartIndexX == this.EndIndexX) {
                    this.Delete1(this.StartIndexX);
                }
                else {
                    this.Delete2(this.StartIndexX, this.EndIndexX);
                }
            }
            else if (this.KeyStates[this.LastKey] && this.LastKey.length == 1) {
                if (this.TextType == TextType_Text || this.TextType == TextType_Number && /^\d+$/.test(this.LastKey)) {
                    this.Delete2(this.StartIndexX, this.EndIndexX);

                    this.Insert(this.StartIndexX, this.LastKey);
                }
            }

            this.KeyMillis = millis() + 0.05 * 1000;
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (!this.IsFocused) {
                this.IsFocused = true;

                this.CursorMillis = millis();
            }

            this.StartIndexX = this.IndexX_(mouseX);
            this.EndIndexX = this.StartIndexX;
        }
        else {
            this.IsFocused = false;
        }

        this.LastKey = "";
    }
    IsLeftDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.IsFocused) {
                this.EndIndexX = this.IndexX_(mouseX);
            }
        }
    }
    KeyPressed(_Key) {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsFocused) {
            this.KeyStates[_Key] = true;

            if (this.KeyStates["Control"]) {
                if (this.KeyStates["a"]) {
                    this.All();
                }
                else if (this.KeyStates["c"]) {
                    this.Copy(this.Text.substring(this.StartIndexX, this.EndIndexX));
                }
                else if (this.KeyStates["v"]) {
                    this.Delete2(this.StartIndexX, this.EndIndexX);

                    this.Paste(this.StartIndexX);
                }
            }
            else if (this.KeyStates["Backspace"]) {
                if (this.StartIndexX == this.EndIndexX) {
                    this.Delete1(this.StartIndexX);
                }
                else {
                    this.Delete2(this.StartIndexX, this.EndIndexX);
                }
            }
            else if (this.KeyStates["Enter"]) {
                this.IsFocused = false;
                this.ENTER();
            }
            else if (this.KeyStates["ArrowRight"]) {
                if (this.StartIndexX == this.EndIndexX) {
                    this.StartIndexX = Mathf.Clamp(this.StartIndexX + 1, 0, this.Text.length);
                    this.EndIndexX = this.StartIndexX;
                }
                else {
                    this.StartIndexX = Math.max(this.StartIndexX, this.EndIndexX);
                    this.EndIndexX = this.StartIndexX;
                }
            }
            else if (this.KeyStates["ArrowLeft"]) {
                if (this.StartIndexX == this.EndIndexX) {
                    this.StartIndexX = Mathf.Clamp(this.StartIndexX - 1, 0, this.Text.length);
                    this.EndIndexX = this.StartIndexX;
                }
                else {
                    this.StartIndexX = Math.min(this.StartIndexX, this.EndIndexX);
                    this.EndIndexX = this.StartIndexX;
                }
            }
            else if (this.KeyStates[_Key] && _Key.length == 1) {
                if (this.TextType == TextType_Text || this.TextType == TextType_Number && /^\d+$/.test(_Key)) {
                    this.Delete2(this.StartIndexX, this.EndIndexX);

                    this.Insert(this.StartIndexX, _Key);

                    this.LastKey = _Key;
                }
            }

            this.KeyMillis = millis() + 0.50 * 1000;
        }
    }
    KeyReleased(_Key) {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (_Key in this.KeyStates) {
            delete this.KeyStates[_Key];
        }
    }
    Delete1(_Index) {
        if (_Index >= 1) {
            this.Text = this.Text.substring(0, _Index - 1) + this.Text.substring(_Index, this.Text.length);

            this.StartIndexX = _Index - 1;
            this.EndIndexX = _Index - 1;
        }
    }
    Delete2(_Index, _EndIndex) {
        if (_Index > _EndIndex) {
            [_Index, _EndIndex] = [_EndIndex, _Index];
        }

        this.Text = this.Text.substring(0, _EndIndex - (_EndIndex - _Index)) + this.Text.substring(_EndIndex, this.Text.length);

        this.StartIndexX = _Index;
        this.EndIndexX = _Index;
    }
    Insert(_Index, _Text) {
        this.Text = this.Text.substring(0, _Index) + _Text + this.Text.substring(_Index, this.Text.length);

        this.StartIndexX = _Index + _Text.length;
        this.EndIndexX = _Index + _Text.length;
    }
    All() {
        this.StartIndexX = 0;
        this.EndIndexX = this.Text.length;
    }
    Copy(_Text) {
        navigator.clipboard.writeText(_Text);
    }
    Paste(_Index) {
        const This = this;

        navigator.clipboard.readText().then(
            function (_Text) {
                This.Insert(_Index, _Text);

                return;
            }
        );
    }

    IndexX_(_PosX) {
        this.Graphic.textSize(this.TextSize);

        let IndexX = 0;

        for (let i = 1; i <= this.Text.length; i++) {
            const TextWidth = this.Graphic.textWidth(this.Text.substring(0, i));

            if (_PosX - this.CornerPosX < Space_Text + TextWidth) {
                IndexX = i - 1;

                break;
            }
            else {
                IndexX = i;
            }
        }

        return IndexX;
    }
    PosX_(_IndexX) {
        this.Graphic.textSize(this.TextSize);

        let PosX = Space_Text;

        if (_IndexX > 0) {
            const TextWidth = this.Graphic.textWidth(this.Text.substring(0, _IndexX));

            PosX += TextWidth;
        }

        return PosX;
    }
}
class LabeledInputField extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _LabelColor, _LabelText, _InputFieldColor, _InputFieldText, _TextSize, _TextType, _ENTER) {
        super(_CornerPosX, _CornerPosY, _Width, _Height);
        this.LabelColor = _LabelColor;
        this.LabelText = _LabelText;
        this.InputFieldColor = _InputFieldColor;
        this.InputFieldText = _InputFieldText;
        this.TextSize = _TextSize;
        this.TextType = _TextType;
        this.ENTER = _ENTER;
        this.Label = new Label(
            this.CornerPosX,
            this.CornerPosY,
            (this.Width / 4) * 1,
            this.Height,
            this.LabelColor,
            this.LabelText,
            this.TextSize
        );
        this.UIs.push(this.Label);
        this.InputField = new InputField(
            this.CornerPosX + (this.Width / 4) * 1,
            this.CornerPosY,
            (this.Width / 4) * 3,
            this.Height,
            this.InputFieldColor,
            this.InputFieldText,
            this.TextSize,
            this.TextType,
            this.ENTER
        );
        this.UIs.push(this.InputField);
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //LabeledInputField
        {
            this.Graphic.clear();
            this.Graphic.background(this.LabelColor.ToColorP5js());

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
}
class TabBarX extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Texts, _TextSize, _SELECT, _SWAP, _ADD, _REMOVE) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Texts = [];
        this.TextSize = _TextSize;
        this.SELECT = _SELECT;
        this.SWAP = _SWAP;
        this.ADD = _ADD;
        this.REMOVE = _REMOVE;
        this.Index = -1;
        this.StartIndex = -1;
        this.EndIndex = -1;
        this.Update();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        const CornerPosX_Remove = this.TabWidth - Width_Remove;
        const CornerPosY_Remove = 0;

        //TabBarX
        {
            this.Graphic.clear();

            for (let i = 0; i < this.Texts.length; i++) {
                const CornerPosX_Tab = i * this.TabWidth;
                const CornerPosY_Tab = 0;

                //Tab
                {
                    this.TabGraphics[i].clear();
                    this.TabGraphics[i].background(this.Color.ToColorP5js());

                    //Text
                    {
                        if (this.TextSize > 0) {
                            this.TextGraphics[i].clear();
                            this.TextGraphics[i].background(this.Color.ToColorP5js());
                            this.TextGraphics[i].fill(Color_Text.ToColorP5js());
                            this.TextGraphics[i].noStroke();
                            this.TextGraphics[i].textAlign("left", "center");
                            this.TextGraphics[i].textSize(this.TextSize);
                            this.TextGraphics[i].text(this.Texts[i], Space_Text, this.TabHeight * 0.5);
                            this.TabGraphics[i].image(this.TextGraphics[i], 0, 0);
                        }
                    }

                    if (i == this.Index) {
                        this.TabGraphics[i].background(Color_DarkShadow.ToColorP5js());
                    }
                    else if (this.MouseIsOnUI()) {
                        const Index = this.Index_(mouseX, mouseY);

                        if (i == Index) {
                            this.TabGraphics[i].background(Color_LightShadow.ToColorP5js());
                        }
                    }

                    //Remove
                    {
                        this.TabGraphics[i].fill(Color_Remove.ToColorP5js());
                        this.TabGraphics[i].noStroke();
                        this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                        this.TabGraphics[i].stroke(0, 0, 0, 255);
                        this.TabGraphics[i].strokeWeight(2);
                        this.TabGraphics[i].line(
                            CornerPosX_Remove + Space_Remove,
                            CornerPosY_Remove + Space_Remove,
                            CornerPosX_Remove + Width_Remove - Space_Remove,
                            CornerPosY_Remove + Height_Remove - Space_Remove
                        );
                        this.TabGraphics[i].line(
                            CornerPosX_Remove + Width_Remove - Space_Remove,
                            CornerPosY_Remove + Space_Remove,
                            CornerPosX_Remove + Space_Remove,
                            CornerPosY_Remove + Height_Remove - Space_Remove
                        );

                        if (this.MouseIsOnRemove()) {
                            const Index = this.Index_(mouseX, mouseY);

                            if (this.IsBeingLeftPressed) {
                                if (this.StartIndex == i && this.StartIndex == Index) {
                                    this.TabGraphics[i].fill(Color_DarkShadow.ToColorP5js());
                                    this.TabGraphics[i].noStroke();
                                    this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                                }
                            }
                            else {
                                if (i == Index) {
                                    this.TabGraphics[i].fill(Color_LightShadow.ToColorP5js());
                                    this.TabGraphics[i].noStroke();
                                    this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                                }
                            }

                        }
                    }

                    this.Graphic.image(this.TabGraphics[i], CornerPosX_Tab, CornerPosY_Tab);
                }
            }

            //Add
            {
                this.AddGraphic.clear();
                this.AddGraphic.background(this.Color.ToColorP5js());
                this.AddGraphic.stroke(0, 0, 0, 255);
                this.AddGraphic.strokeWeight(2);
                this.AddGraphic.line(
                    this.TabWidth * 0.5 + 3,
                    this.TabHeight * 0.5,
                    this.TabWidth * 0.5 - 3,
                    this.TabHeight * 0.5
                );
                this.AddGraphic.line(
                    this.TabWidth * 0.5,
                    this.TabHeight * 0.5 + 3,
                    this.TabWidth * 0.5,
                    this.TabHeight * 0.5 - 3
                );

                if (this.MouseIsOnAdd()) {
                    if (this.IsBeingLeftPressed && this.StartIndex == this.Texts.length) {
                        this.AddGraphic.background(Color_DarkShadow.ToColorP5js());
                    }
                    else {
                        this.AddGraphic.background(Color_LightShadow.ToColorP5js());
                    }
                }

                this.Graphic.image(this.AddGraphic, this.TabWidth * this.Texts.length, 0);
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnAdd()) {
                this.IsBeingLeftPressed = true;

                this.StartIndex = this.Index_(mouseX, mouseY);
            }
            else if (this.MouseIsOnRemove()) {
                this.IsBeingLeftPressed = true;

                this.StartIndex = this.Index_(mouseX, mouseY);
            }
            else {
                this.IsBeingLeftDragged = true;

                this.Index = this.Index_(mouseX, mouseY);

                this.StartIndex = this.Index;

                this.SELECT();
            }
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnAdd()) {
                if (this.IsBeingLeftPressed) {
                    this.EndIndex = this.Index_(mouseX, mouseY);

                    if (this.StartIndex == this.EndIndex) {
                        this.ADD();
                    }
                }
            }
            else if (this.MouseIsOnRemove()) {
                if (this.IsBeingLeftPressed) {
                    this.EndIndex = this.Index_(mouseX, mouseY);

                    if (this.StartIndex == this.EndIndex) {
                        this.Remove(this.EndIndex);
                        this.REMOVE(this.EndIndex);
                    }
                }
            }
            else if (this.IsBeingLeftDragged) {
                this.EndIndex = this.Index_(mouseX, mouseY);

                if (this.StartIndex != this.EndIndex) {
                    this.Index = this.EndIndex;

                    [this.Texts[this.StartIndex], this.Texts[this.EndIndex]] = [this.Texts[this.EndIndex], this.Texts[this.StartIndex]];

                    this.SWAP();
                }
            }
        }

        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
    }
    Add(_Text) {
        this.Texts.push(_Text);

        this.Update();

        this.Index = this.Texts.length - 1;
    }
    Remove(_Index) {
        if (this.TabGraphics[_Index] != null) this.TabGraphics[_Index].remove();
        this.TabGraphics.splice(_Index, 1);
        if (this.TextGraphics[_Index] != null) this.TextGraphics[_Index].remove();
        this.TextGraphics.splice(_Index, 1);
        this.Texts.splice(_Index, 1);

        this.Update();

        if (this.Index > _Index) {
            this.Index -= 1;
        }
        this.Index = Mathf.Clamp(this.Index, 0, this.Texts.length - 1);
    }
    Update() {
        this.TabWidth = this.Width / (this.Texts.length + 1);
        this.TabHeight = this.Height;
        this.TabGraphics = new Array(this.Texts.length);
        this.TextGraphics = new Array(this.Texts.length);
        for (let i = 0; i < this.Texts.length; i++) {
            if (this.TabGraphics[i] != null) this.TabGraphics[i].remove();
            this.TabGraphics[i] = createGraphics(this.TabWidth - Space_Tab, this.TabHeight);
            if (this.TextGraphics[i] != null) this.TextGraphics[i].remove();
            this.TextGraphics[i] = createGraphics(this.TabWidth - Width_Remove - Space_Text, this.TabHeight);
        }
        if (this.AddGraphic != null) this.AddGraphic.remove();
        this.AddGraphic = createGraphics(this.TabWidth - Space_Tab, this.TabHeight);
    }

    Index_(_PosX, _PosY) {
        return floor((_PosX - this.CornerPosX) / (this.Width / (this.Texts.length + 1)));
    }

    MouseIsOnAdd() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        return this.CornerPosX + this.Width - this.TabWidth - 1 < mouseX && mouseX < this.CornerPosX + this.Width && this.CornerPosY - 1 < mouseY && mouseY < this.CornerPosY + this.TabHeight;
    }
    MouseIsOnRemove() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        const Index_Tab = this.Index_(mouseX, mouseY);

        return this.CornerPosX + this.TabWidth * (Index_Tab + 1) - Width_Remove - 1 < mouseX && mouseX < this.CornerPosX + this.TabWidth * (Index_Tab + 1) && this.CornerPosY - 1 < mouseY && mouseY < this.CornerPosY + Height_Remove;
    }
}
class TabBarY extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Texts, _TextSize, _SELECT, _SWAP, _ADD, _REMOVE) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Texts = _Texts;
        this.TextSize = _TextSize;
        this.SELECT = _SELECT;
        this.SWAP = _SWAP;
        this.ADD = _ADD;
        this.REMOVE = _REMOVE;
        this.Index = -1;
        this.StartIndex = -1;
        this.EndIndex = -1;
        this.Update();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        const CornerPosX_Remove = this.TabWidth - Width_Remove;
        const CornerPosY_Remove = 0;

        //TabBarY
        {
            this.Graphic.clear();

            for (let i = 0; i < this.Texts.length; i++) {
                const CornerPosX_Tab = 0;
                const CornerPosY_Tab = i * this.TabHeight;

                //Tab
                {
                    this.TabGraphics[i].clear();
                    this.TabGraphics[i].background(this.Color.ToColorP5js());

                    //Text
                    {
                        if (this.TextSize > 0) {
                            this.TextGraphics[i].clear();
                            this.TextGraphics[i].background(this.Color.ToColorP5js());
                            this.TextGraphics[i].fill(Color_Text.ToColorP5js());
                            this.TextGraphics[i].noStroke();
                            this.TextGraphics[i].textAlign("left", "center");
                            this.TextGraphics[i].textSize(this.TextSize);
                            this.TextGraphics[i].text(this.Texts[i], Space_Text, this.TabHeight * 0.5);
                            this.TabGraphics[i].image(this.TextGraphics[i], 0, 0);
                        }
                    }

                    if (i == this.Index) {
                        this.TabGraphics[i].background(Color_DarkShadow.ToColorP5js());
                    }
                    else if (this.MouseIsOnUI()) {
                        const Index = this.Index_(mouseX, mouseY);

                        if (i == Index) {
                            this.TabGraphics[i].background(Color_LightShadow.ToColorP5js());
                        }
                    }

                    //Remove
                    {
                        this.TabGraphics[i].fill(Color_Remove.ToColorP5js());
                        this.TabGraphics[i].noStroke();
                        this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                        this.TabGraphics[i].stroke(0, 0, 0, 255);
                        this.TabGraphics[i].strokeWeight(2);
                        this.TabGraphics[i].line(
                            CornerPosX_Remove + Space_Remove,
                            CornerPosY_Remove + Space_Remove,
                            CornerPosX_Remove + Width_Remove - Space_Remove,
                            CornerPosY_Remove + Height_Remove - Space_Remove
                        );
                        this.TabGraphics[i].line(
                            CornerPosX_Remove + Width_Remove - Space_Remove,
                            CornerPosY_Remove + Space_Remove,
                            CornerPosX_Remove + Space_Remove,
                            CornerPosY_Remove + Height_Remove - Space_Remove
                        );

                        if (this.MouseIsOnRemove()) {
                            const Index = this.Index_(mouseX, mouseY);

                            if (this.IsBeingLeftPressed) {
                                if (this.StartIndex == i && this.StartIndex == Index) {
                                    this.TabGraphics[i].fill(Color_DarkShadow.ToColorP5js());
                                    this.TabGraphics[i].noStroke();
                                    this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                                }
                            }
                            else {
                                if (i == Index) {
                                    this.TabGraphics[i].fill(Color_LightShadow.ToColorP5js());
                                    this.TabGraphics[i].noStroke();
                                    this.TabGraphics[i].rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                                }
                            }

                        }
                    }

                    this.Graphic.image(this.TabGraphics[i], CornerPosX_Tab, CornerPosY_Tab);
                }
            }

            //Add
            {
                this.AddGraphic.clear();
                this.AddGraphic.background(this.Color.ToColorP5js());
                this.AddGraphic.stroke(0, 0, 0, 255);
                this.AddGraphic.strokeWeight(2);
                this.AddGraphic.line(
                    this.TabWidth * 0.5 + 3,
                    this.TabHeight * 0.5,
                    this.TabWidth * 0.5 - 3,
                    this.TabHeight * 0.5
                );
                this.AddGraphic.line(
                    this.TabWidth * 0.5,
                    this.TabHeight * 0.5 + 3,
                    this.TabWidth * 0.5,
                    this.TabHeight * 0.5 - 3
                );

                if (this.MouseIsOnAdd()) {
                    if (this.IsBeingLeftPressed && this.StartIndex == this.Texts.length) {
                        this.AddGraphic.background(Color_DarkShadow.ToColorP5js());
                    }
                    else {
                        this.AddGraphic.background(Color_LightShadow.ToColorP5js());
                    }
                }

                this.Graphic.image(this.AddGraphic, 0, this.TabHeight * this.Texts.length);
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnAdd()) {
                this.IsBeingLeftPressed = true;

                this.StartIndex = this.Index_(mouseX, mouseY);
            }
            else if (this.MouseIsOnRemove()) {
                this.IsBeingLeftPressed = true;

                this.StartIndex = this.Index_(mouseX, mouseY);
            }
            else {
                this.IsBeingLeftDragged = true;

                this.Index = this.Index_(mouseX, mouseY);

                this.StartIndex = this.Index;

                this.SELECT();
            }
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnAdd()) {
                if (this.IsBeingLeftPressed) {
                    this.EndIndex = this.Index_(mouseX, mouseY);

                    if (this.StartIndex == this.EndIndex) {
                        this.ADD();
                    }
                }
            }
            else if (this.MouseIsOnRemove()) {
                if (this.IsBeingLeftPressed) {
                    this.EndIndex = this.Index_(mouseX, mouseY);

                    if (this.StartIndex == this.EndIndex) {
                        this.Remove(this.EndIndex);
                        this.REMOVE(this.EndIndex);
                    }
                }
            }
            else if (this.IsBeingLeftDragged) {
                this.EndIndex = this.Index_(mouseX, mouseY);

                if (this.StartIndex != this.EndIndex) {
                    this.Index = this.EndIndex;

                    [this.Texts[this.StartIndex], this.Texts[this.EndIndex]] = [this.Texts[this.EndIndex], this.Texts[this.StartIndex]];

                    this.SWAP();
                }
            }
        }

        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
    }
    Add(_Text) {
        this.Texts.push(_Text);

        this.Update();

        this.Index = this.Texts.length - 1;
    }
    Remove(_Index) {
        if (this.TabGraphics[_Index] != null) this.TabGraphics[_Index].remove();
        this.TabGraphics.splice(_Index, 1);
        if (this.TextGraphics[_Index] != null) this.TextGraphics[_Index].remove();
        this.TextGraphics.splice(_Index, 1);
        this.Texts.splice(_Index, 1);

        this.Update();

        if (this.Index > _Index) {
            this.Index -= 1;
        }
        this.Index = Mathf.Clamp(this.Index, 0, this.Texts.length - 1);
    }
    Update() {
        this.TabWidth = this.Width;
        this.TabHeight = this.Height / (this.Texts.length + 1);
        this.TabGraphics = new Array(this.Texts.length);
        this.TextGraphics = new Array(this.Texts.length);
        for (let i = 0; i < this.Texts.length; i++) {
            if (this.TabGraphics[i] != null) this.TabGraphics[i].remove();
            this.TabGraphics[i] = createGraphics(this.TabWidth, this.TabHeight - Space_Tab);
            if (this.TextGraphics[i] != null) this.TextGraphics[i].remove();
            this.TextGraphics[i] = createGraphics(this.TabWidth - Width_Remove - Space_Text, this.TabHeight);
        }
        if (this.AddGraphic != null) this.AddGraphic.remove();
        this.AddGraphic = createGraphics(this.TabWidth, this.TabHeight - Space_Tab);
    }

    Index_(_PosX, _PosY) {
        return floor((_PosY - this.CornerPosY) / (this.Height / (this.Texts.length + 1)));
    }

    MouseIsOnAdd() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        return this.CornerPosX - 1 < mouseX && mouseX < this.CornerPosX + this.TabWidth && this.CornerPosY + this.Height - this.TabHeight - 1 < mouseY && mouseY < this.CornerPosY + this.Height;
    }
    MouseIsOnRemove() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        const Index_Tab = this.Index_(mouseX, mouseY);

        return this.CornerPosX + this.TabWidth - Width_Remove - 1 < mouseX && mouseX < this.CornerPosX + this.TabWidth && this.CornerPosY + this.TabHeight * (Index_Tab + 0) - 1 < mouseY && mouseY < this.CornerPosY + this.TabHeight * (Index_Tab + 0) + Height_Remove;
    }
}
class ButtonBarX extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Texts, _TextSize, _SELECT) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Texts = _Texts;
        this.TextSize = _TextSize;
        this.SELECT = _SELECT;
        this.Index = -1;
        this.LastIndex = -1;
        this.Update();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //ButtonBarX
        {
            this.Graphic.clear();

            for (let i = 0; i < this.Texts.length; i++) {
                const CornerPosX_Tab = i * this.TabWidth;
                const CornerPosY_Tab = 0;

                //Button
                {
                    this.TabGraphics[i].clear();
                    this.TabGraphics[i].background(this.Color.ToColorP5js());

                    //Text
                    {
                        if (this.TextSize > 0) {
                            this.TextGraphics[i].clear();
                            this.TextGraphics[i].background(this.Color.ToColorP5js());
                            this.TextGraphics[i].fill(Color_Text.ToColorP5js());
                            this.TextGraphics[i].noStroke();
                            this.TextGraphics[i].textAlign("center", "center");
                            this.TextGraphics[i].textSize(this.TextSize);
                            this.TextGraphics[i].text(this.Texts[i], this.TabWidth * 0.5, this.TabHeight * 0.5);
                            this.TabGraphics[i].image(this.TextGraphics[i], 0, 0);
                        }
                    }

                    if (i == this.Index) {
                        this.TabGraphics[i].background(Color_DarkShadow.ToColorP5js());
                    }
                    else if (this.MouseIsOnUI()) {
                        const Index = this.Index_(mouseX, mouseY);

                        if (i == Index) {
                            this.TabGraphics[i].background(Color_LightShadow.ToColorP5js());
                        }
                    }

                    this.Graphic.image(this.TabGraphics[i], CornerPosX_Tab, CornerPosY_Tab);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingLeftPressed = true;

            this.Index = this.Index_(mouseX, mouseY);
            this.LastIndex = this.Index;
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI() && this.IsBeingLeftPressed) {
            const Index = this.Index_(mouseX, mouseY);

            if (this.Index == Index) {
                this.SELECT();
            }
        }

        this.Index = -1;

        this.IsBeingLeftPressed = false;
    }
    Add(_Text) {
        this.Texts.push(_Text);

        this.Update();
    }
    Update() {
        this.TabWidth = this.Width / this.Texts.length;
        this.TabHeight = this.Height;
        this.TabGraphics = new Array(this.Texts.length);
        this.TextGraphics = new Array(this.Texts.length);
        for (let i = 0; i < this.Texts.length; i++) {
            if (this.TabGraphics[i] != null) this.TabGraphics[i].remove();
            this.TabGraphics[i] = createGraphics(this.TabWidth - Space_Tab, this.TabHeight);
            if (this.TextGraphics[i] != null) this.TextGraphics[i].remove();
            this.TextGraphics[i] = createGraphics(this.TabWidth, this.TabHeight);
        }
    }

    Index_(_PosX, _PosY) {
        return floor((_PosX - this.CornerPosX) / (this.Width / this.Texts.length));
    }
}
class ButtonBarY extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Texts, _TextSize, _SELECT) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Texts = _Texts;
        this.TextSize = _TextSize;
        this.SELECT = _SELECT;
        this.Index = -1;
        this.LastIndex = -1;
        this.Update();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //ButtonBarY
        {
            this.Graphic.clear();

            for (let i = 0; i < this.Texts.length; i++) {
                const CornerPosX_Tab = 0;
                const CornerPosY_Tab = i * this.TabHeight;

                //Button
                {
                    this.TabGraphics[i].clear();
                    this.TabGraphics[i].background(this.Color.ToColorP5js());

                    //Text
                    {
                        if (this.TextSize > 0) {
                            this.TextGraphics[i].clear();
                            this.TextGraphics[i].background(this.Color.ToColorP5js());
                            this.TextGraphics[i].fill(Color_Text.ToColorP5js());
                            this.TextGraphics[i].noStroke();
                            this.TextGraphics[i].textAlign("center", "center");
                            this.TextGraphics[i].textSize(this.TextSize);
                            this.TextGraphics[i].text(this.Texts[i], this.Width * 0.5, this.TabHeight * 0.5);
                            this.TabGraphics[i].image(this.TextGraphics[i], 0, 0);
                        }
                    }

                    if (i == this.Index) {
                        this.TabGraphics[i].background(Color_DarkShadow.ToColorP5js());
                    }
                    else if (this.MouseIsOnUI()) {
                        const Index = this.Index_(mouseX, mouseY);

                        if (i == Index) {
                            this.TabGraphics[i].background(Color_LightShadow.ToColorP5js());
                        }
                    }

                    this.Graphic.image(this.TabGraphics[i], CornerPosX_Tab, CornerPosY_Tab);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingLeftPressed = true;

            this.Index = this.Index_(mouseX, mouseY);
            this.LastIndex = this.Index;
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI() && this.IsBeingLeftPressed) {
            const Index = this.Index_(mouseX, mouseY);

            if (this.Index == Index) {
                this.SELECT();
            }
        }

        this.Index = -1;

        this.IsBeingLeftPressed = false;
    }
    Add(_Text) {
        this.Texts.push(_Text);

        this.Update();
    }
    Update() {
        this.TabWidth = this.Width;
        this.TabHeight = this.Height / this.Texts.length;
        this.TabGraphics = new Array(this.Texts.length);
        this.TextGraphics = new Array(this.Texts.length);
        for (let i = 0; i < this.Texts.length; i++) {
            if (this.TabGraphics[i] != null) this.TabGraphics[i].remove();
            this.TabGraphics[i] = createGraphics(this.TabWidth, this.TabHeight - Space_Tab);
            if (this.TextGraphics[i] != null) this.TextGraphics[i].remove();
            this.TextGraphics[i] = createGraphics(this.TabWidth, this.TabHeight);
        }
    }

    Index_(_PosX, _PosY) {

        return floor((_PosY - this.CornerPosY) / (this.Height / this.Texts.length));
    }
}
class ScrollBarX extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _CurrentValue, _MinValue, _MaxValue, _TextSize) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.CurrentValue = _CurrentValue;
        this.MinValue = _MinValue;
        this.MaxValue = _MaxValue;
        this.TextSize = _TextSize;
        this.PointerWidth = this.Width * 0.25;
        this.PointerHeight = this.Height;
        if (this.TextGraphic != null) this.TextGraphic.remove();
        this.TextGraphic = createGraphics(this.PointerWidth, this.PointerHeight);
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        const CornerPosX_Pointer = map(this.CurrentValue, this.MinValue, this.MaxValue, this.PointerWidth * 0.5, this.Width - this.PointerWidth * 0.5) - this.PointerWidth * 0.5;
        const CornerPosY_Pointer = 0;

        //ScrollBarX
        {
            this.Graphic.clear();
            this.Graphic.background(255, 255, 255, 255);

            //Pointer
            {
                this.Graphic.fill(this.Color.ToColorP5js());
                this.Graphic.noStroke();
                this.Graphic.rect(
                    CornerPosX_Pointer,
                    CornerPosY_Pointer,
                    this.PointerWidth,
                    this.PointerHeight
                );

                //Text
                {
                    if (this.TextSize > 0) {
                        this.TextGraphic.clear();
                        this.TextGraphic.background(this.Color.ToColorP5js());
                        this.TextGraphic.fill(Color_Text.ToColorP5js());
                        this.TextGraphic.noStroke();
                        this.TextGraphic.textAlign("center", "center");
                        this.TextGraphic.textSize(this.TextSize);
                        this.TextGraphic.text(floor(this.CurrentValue), this.PointerWidth * 0.5, this.PointerHeight * 0.5);
                        this.Graphic.image(this.TextGraphic, CornerPosX_Pointer, 0);
                    }
                }

                if (this.IsBeingLeftDragged) {
                    this.Graphic.fill(Color_DarkShadow.ToColorP5js());
                    this.Graphic.noStroke();
                    this.Graphic.rect(
                        CornerPosX_Pointer,
                        CornerPosY_Pointer,
                        this.PointerWidth,
                        this.PointerHeight
                    );
                }
                else {
                    if (this.MouseIsOnPointer()) {
                        this.Graphic.fill(Color_LightShadow.ToColorP5js());
                        this.Graphic.noStroke();
                        this.Graphic.rect(
                            CornerPosX_Pointer,
                            CornerPosY_Pointer,
                            this.PointerWidth,
                            this.PointerHeight
                        );
                    }
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingLeftDragged = true;

            this.Update();
        }
    }
    IsLeftDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingLeftDragged) {
            this.Update();
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.IsBeingLeftDragged = false;
    }
    SetCurrentValue(_Value) {
        this.CurrentValue = Mathf.Clamp(_Value, this.MinValue, this.MaxValue);
    }
    SetMinValue(_Value) {
        this.MinValue = _Value;
    }
    SetMaxValue(_Value) {
        this.MaxValue = _Value;
    }
    Update() {
        this.SetCurrentValue(
            map(
                mouseX - this.CornerPosX,
                this.PointerWidth * 0.5,
                this.Width - this.PointerWidth * 0.5,
                this.MinValue,
                this.MaxValue
            )
        );
    }

    MouseIsOnPointer() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        const PosX = map(this.CurrentValue, this.MinValue, this.MaxValue, this.PointerWidth * 0.5, this.Width - this.PointerWidth * 0.5) - this.PointerWidth * 0.5;
        const PosY = 0;

        return this.CornerPosX + PosX - 1 < mouseX && mouseX < this.CornerPosX + PosX + this.PointerWidth && this.CornerPosY + PosY - 1 < mouseY && mouseY < this.CornerPosY + PosY + this.PointerHeight;
    }
}
class ScrollBarY extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _CurrentValue, _MinValue, _MaxValue, _TextSize) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.CurrentValue = _CurrentValue;
        this.MinValue = _MinValue;
        this.MaxValue = _MaxValue;
        this.TextSize = _TextSize;
        this.PointerWidth = this.Width;
        this.PointerHeight = this.Height * 0.25;
        if (this.TextGraphic != null) this.TextGraphic.remove();
        this.TextGraphic = createGraphics(this.PointerWidth, this.PointerHeight);
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        const CornerPosX_Pointer = 0;
        const CornerPosY_Pointer = map(this.CurrentValue, this.MinValue, this.MaxValue, this.PointerHeight * 0.5, this.Height - this.PointerHeight * 0.5) - this.PointerHeight * 0.5;

        //ScrollBarY
        {
            this.Graphic.clear();
            this.Graphic.background(255, 255, 255, 255);

            //Pointer
            {
                this.Graphic.fill(this.Color.ToColorP5js());
                this.Graphic.noStroke();
                this.Graphic.rect(
                    CornerPosX_Pointer,
                    CornerPosY_Pointer,
                    this.PointerWidth,
                    this.PointerHeight
                );

                //Text
                {
                    if (this.TextSize > 0) {
                        this.TextGraphic.clear();
                        this.TextGraphic.background(this.Color.ToColorP5js());
                        this.TextGraphic.fill(Color_Text.ToColorP5js());
                        this.TextGraphic.noStroke();
                        this.TextGraphic.textAlign("center", "center");
                        this.TextGraphic.textSize(this.TextSize);
                        this.TextGraphic.text(floor(this.CurrentValue), this.PointerWidth * 0.5, this.PointerHeight * 0.5);
                        this.Graphic.image(this.TextGraphic, 0, CornerPosY_Pointer);
                    }
                }

                if (this.IsBeingLeftDragged) {
                    this.Graphic.fill(Color_DarkShadow.ToColorP5js());
                    this.Graphic.noStroke();
                    this.Graphic.rect(
                        CornerPosX_Pointer,
                        CornerPosY_Pointer,
                        this.PointerWidth,
                        this.PointerHeight
                    );
                }
                else {
                    if (this.MouseIsOnPointer()) {
                        this.Graphic.fill(Color_LightShadow.ToColorP5js());
                        this.Graphic.noStroke();
                        this.Graphic.rect(
                            CornerPosX_Pointer,
                            CornerPosY_Pointer,
                            this.PointerWidth,
                            this.PointerHeight
                        );
                    }
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingLeftDragged = true;

            this.Update();
        }
    }
    IsLeftDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingLeftDragged) {
            this.Update();
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.IsBeingLeftDragged = false;
    }
    SetCurrentValue(_Value) {
        this.CurrentValue = Mathf.Clamp(_Value, this.MinValue, this.MaxValue);
    }
    SetMinValue(_Value) {
        this.MinValue = _Value;
    }
    SetMaxValue(_Value) {
        this.MaxValue = _Value;
    }
    Update() {
        this.SetCurrentValue(
            map(
                mouseY - this.CornerPosY,
                this.PointerHeight * 0.5,
                this.Height - this.PointerHeight * 0.5,
                this.MinValue,
                this.MaxValue
            )
        );
    }

    MouseIsOnPointer() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        const PosX = 0;
        const PosY = map(this.CurrentValue, this.MinValue, this.MaxValue, this.PointerHeight * 0.5, this.Height - this.PointerHeight * 0.5) - this.PointerHeight * 0.5;

        return this.CornerPosX + PosX - 1 < mouseX && mouseX < this.CornerPosX + PosX + this.PointerWidth && this.CornerPosY + PosY - 1 < mouseY && mouseY < this.CornerPosY + PosY + this.PointerHeight;
    }
}
class ModalMenu extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Text, _TextSize, _UIs, _REMOVE) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Text = _Text;
        this.TextSize = _TextSize;
        this.UIs = _UIs;
        this.REMOVE = _REMOVE;
        if (this.ShadowGraphic != null) this.ShadowGraphic.remove();
        this.ShadowGraphic = createGraphics(Width_Sketch, Height_Sketch);
        if (this.TextGraphic != null) this.TextGraphic.remove();
        this.TextGraphic = createGraphics(this.Width - Width_Remove - Space_Text, this.TextSize * 2);
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        const CornerPosX_Remove = this.Width - Width_Remove;
        const CornerPosY_Remove = 0;

        //Shadow
        {
            this.ShadowGraphic.clear();
            this.ShadowGraphic.background(Color_DarkShadow.ToColorP5js());
            image(this.ShadowGraphic, 0, 0);
        }

        //ModalMenu
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            {
                this.Graphic.fill(255, 255);
                this.Graphic.noStroke();
                this.Graphic.rect(0, 0, this.Width, this.TextSize * 2);
            }

            //Text
            {
                if (this.TextSize > 0) {
                    this.TextGraphic.clear();
                    this.TextGraphic.background(255, 255);
                    this.TextGraphic.fill(Color_Text.ToColorP5js());
                    this.TextGraphic.noStroke();
                    this.TextGraphic.textAlign("left", "center");
                    this.TextGraphic.textSize(this.TextSize);
                    this.TextGraphic.text(this.Text, Space_Text, this.TextSize);
                    this.Graphic.image(this.TextGraphic, 0, 0);
                }
            }

            //Remove
            {
                this.Graphic.fill(Color_Remove.ToColorP5js());
                this.Graphic.noStroke();
                this.Graphic.rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                this.Graphic.stroke(0, 0, 0, 255);
                this.Graphic.strokeWeight(2);
                this.Graphic.line(
                    CornerPosX_Remove + Space_Remove,
                    CornerPosY_Remove + Space_Remove,
                    CornerPosX_Remove + Width_Remove - Space_Remove,
                    CornerPosY_Remove + Height_Remove - Space_Remove
                );
                this.Graphic.line(
                    CornerPosX_Remove + Width_Remove - Space_Remove,
                    CornerPosY_Remove + Space_Remove,
                    CornerPosX_Remove + Space_Remove,
                    CornerPosY_Remove + Height_Remove - Space_Remove
                );

                if (this.MouseIsOnRemove()) {
                    this.Graphic.fill(Color_LightShadow.ToColorP5js());
                    this.Graphic.noStroke();
                    this.Graphic.rect(CornerPosX_Remove, CornerPosY_Remove, Width_Remove, Height_Remove);
                    this.Graphic.stroke(0, 0, 0, 255);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnRemove()) {
                this.IsBeingLeftPressed = true;
            }
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (this.MouseIsOnRemove()) {
                if (this.IsBeingLeftPressed) {
                    this.Remove();
                    this.REMOVE();
                }
            }
        }

        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
    }
    Open() {
        for (let i = 0; i < UIs[RenderQueue_General].length; i++) {
            UIs[RenderQueue_General][i].SetIsAvailable(false);
        }

        this.SetIsVisible(true);
        this.SetIsAvailable(true);
    }
    Remove() {
        for (let i = 0; i < UIs[RenderQueue_General].length; i++) {
            UIs[RenderQueue_General][i].SetIsAvailable(true);
        }

        this.SetIsVisible(false);
        this.SetIsAvailable(false);

        this.REMOVE();
    }

    MouseIsOnRemove() {
        if (!this.IsVisible || !this.IsAvailable) {
            return false;
        }

        return this.CornerPosX + this.Width - Width_Remove - 1 < mouseX && mouseX < this.CornerPosX + this.Width && this.CornerPosY - 1 < mouseY && mouseY < this.CornerPosY + Height_Remove;
    }
}
class PhotoEditor extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _Zoom, _Photo, _BackgroundPhoto) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.InitialZoom = _Zoom;
        this.Photo = _Photo;
        this.BackgroundPhoto = _BackgroundPhoto;
        this.ScrollBarX = new ScrollBarX(
            this.CornerPosX,
            this.CornerPosY + this.Height + Space_UI1,
            this.Width,
            Height_ScrollBarX,
            this.Color,
            0,
            -this.Photo.Width * 0.5,
            this.Photo.Width * 0.5,
            0
        );
        this.UIs.push(this.ScrollBarX);
        this.ScrollBarY = new ScrollBarY(
            this.CornerPosX + this.Width + Space_UI1,
            this.CornerPosY,
            Width_ScrollBarY,
            this.Height,
            this.Color,
            0,
            -this.Photo.Height * 0.5,
            this.Photo.Height * 0.5,
            0
        );
        this.UIs.push(this.ScrollBarY);
        this.StartIndexX = -1;
        this.StartIndexY = -1;
        this.EndIndexX = -1;
        this.EndIndexY = -1;
        this.LastEndIndexX = -1;
        this.LastEndIndexY = -1;
        this.Index2s = [];
        this.Pos2s = [];
        this.HistoryIndex = 0;
        this.History = [];
        this.KeyStates = {};
        this.Graphic.drawingContext.imageSmoothingEnabled = false;
        this.Graphic.drawingContext.mozPhotomoothingEnabled = false;
        this.Graphic.drawingContext.webkitPhotomoothingEnabled = false;
        this.Graphic.drawingContext.msPhotomoothingEnabled = false;
        this.Save();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //PhotoEditor
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            if (this.Photo.HasData()) {
                const OffsetX = this.Width * 0.5 - (this.Photo.Width * 0.5) * this.InitialZoom;
                const OffsetY = this.Height * 0.5 - (this.Photo.Height * 0.5) * this.InitialZoom;

                const PosX = OffsetX - this.ScrollBarX.CurrentValue * this.InitialZoom;
                const PosY = OffsetY - this.ScrollBarY.CurrentValue * this.InitialZoom;

                const Width = this.Photo.Width * this.InitialZoom;
                const Height = this.Photo.Height * this.InitialZoom;

                this.Graphic.image(this.BackgroundPhoto.Graphic, PosX, PosY, Width, Height);
                this.Graphic.image(this.Photo.Graphic, PosX, PosY, Width, Height);

                if (this.InitialZoom >= 10) {
                    this.Graphic.fill(this.Color.ToColorP5js());
                    this.Graphic.noStroke();

                    for (let i = 0; i < this.Photo.Width; i++) {
                        const PosX_ = PosX + i * this.InitialZoom;

                        if (PosX_ < -this.InitialZoom || this.Width < PosX_) {
                            continue;
                        }

                        this.Graphic.rect(PosX_, PosY, 1, Height);
                    }

                    for (let i = 0; i < this.Photo.Height; i++) {
                        const PosY_ = PosY + i * this.InitialZoom;

                        if (PosY_ < -this.InitialZoom || this.Height < PosY_) {
                            continue;
                        }

                        this.Graphic.rect(PosX, PosY_, Width, 1);
                    }
                }

                if (PaintTools.length > 0) {
                    if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                        if (PaintTools[TabBarY_PaintTool.Index].Index2s.length > 0) {
                            const MinIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X < Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MinIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y < Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;
                            const MaxIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X > Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MaxIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y > Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;

                            const MinPosX = this.PosX_(MinIndexX) - this.InitialZoom * 0.5;
                            const MinPosY = this.PosY_(MinIndexY) - this.InitialZoom * 0.5;
                            const MaxPosX = this.PosX_(MaxIndexX) + this.InitialZoom * 0.5;
                            const MaxPosY = this.PosY_(MaxIndexY) + this.InitialZoom * 0.5;

                            PaintTools[TabBarY_PaintTool.Index].Pos2s = RectAlgorithm(MinPosX, MinPosY, MaxPosX, MaxPosY);

                            if (PaintTools[TabBarY_PaintTool.Index].Photo.HasData()) {
                                this.Graphic.image(
                                    PaintTools[TabBarY_PaintTool.Index].Photo.Graphic,
                                    PaintTools[TabBarY_PaintTool.Index].Pos2s[0].X,
                                    PaintTools[TabBarY_PaintTool.Index].Pos2s[0].Y,
                                    PaintTools[TabBarY_PaintTool.Index].Photo.Width * this.InitialZoom,
                                    PaintTools[TabBarY_PaintTool.Index].Photo.Height * this.InitialZoom
                                );

                                if (this.InitialZoom >= 10) {
                                    this.Graphic.fill(this.Color.ToColorP5js());
                                    this.Graphic.noStroke();

                                    for (let i = 0; i < PaintTools[TabBarY_PaintTool.Index].Photo.Width; i++) {
                                        const PosX_ = PaintTools[TabBarY_PaintTool.Index].Pos2s[0].X + i * this.InitialZoom;

                                        if (PosX_ < -this.InitialZoom || this.Width < PosX_) {
                                            continue;
                                        }

                                        this.Graphic.rect(PosX_, PaintTools[TabBarY_PaintTool.Index].Pos2s[0].Y, 1, PaintTools[TabBarY_PaintTool.Index].Photo.Height * this.InitialZoom);
                                    }

                                    for (let i = 0; i < PaintTools[TabBarY_PaintTool.Index].Photo.Height; i++) {
                                        const PosY_ = PaintTools[TabBarY_PaintTool.Index].Pos2s[0].Y + i * this.InitialZoom;

                                        if (PosY_ < -this.InitialZoom || this.Height < PosY_) {
                                            continue;
                                        }

                                        this.Graphic.rect(PaintTools[TabBarY_PaintTool.Index].Pos2s[0].X, PosY_, PaintTools[TabBarY_PaintTool.Index].Photo.Width * this.InitialZoom, 1);
                                    }
                                }
                            }

                            this.Graphic.strokeWeight(1);
                            for (let i = 0; i < PaintTools[TabBarY_PaintTool.Index].Pos2s.length; i++) {
                                const Pos2 = PaintTools[TabBarY_PaintTool.Index].Pos2s[i];

                                if (Pos2.X < 0 || this.Width < Pos2.X || Pos2.Y < 0 || this.Height < Pos2.Y) {
                                    continue;
                                }

                                const IndexX_Cell = this.IndexX_(this.CornerPosX + Pos2.X - 1);
                                const IndexY_Cell = this.IndexY_(this.CornerPosY + Pos2.Y - 1);

                                if (PaintTools[TabBarY_PaintTool.Index].Photo.HasData()) {
                                    if ((IndexX_Cell + IndexY_Cell + Math.floor(millis() / 250)) % 2 == 0) {
                                        this.Graphic.stroke(127, 255);
                                    }
                                    else {
                                        this.Graphic.stroke(63, 63, 255, 255);
                                    }
                                }
                                else {
                                    if ((IndexX_Cell + IndexY_Cell + Math.floor(millis() / 250)) % 2 == 0) {
                                        this.Graphic.stroke(127, 255);
                                    }
                                    else {
                                        this.Graphic.stroke(255, 63, 63, 255);
                                    }
                                }

                                this.Graphic.point(Pos2.X - 1, Pos2.Y - 1);
                            }
                        }
                    }
                    else {
                        switch (PaintTools[TabBarY_PaintTool.Index].PaintToolID) {
                            case PaintToolID_Pencil:
                            case PaintToolID_Brush:
                            case PaintToolID_Bucket:
                                break;
                            case PaintToolID_Line:
                            case PaintToolID_Rect:
                            case PaintToolID_Circle:
                                this.Graphic.strokeWeight(1);
                                for (let i = 0; i < this.Pos2s.length; i++) {
                                    const Pos2 = this.Pos2s[i];

                                    if (Pos2.X < 0 || this.Width < Pos2.X || Pos2.Y < 0 || this.Height < Pos2.Y) {
                                        continue;
                                    }

                                    const IndexX_Cell = this.IndexX_(this.CornerPosX + Pos2.X - 1);
                                    const IndexY_Cell = this.IndexY_(this.CornerPosY + Pos2.Y - 1);

                                    if (this.Photo.IndexIsOnPhoto(IndexX_Cell, IndexY_Cell)) {
                                        this.Graphic.stroke(this.Photo.Get(IndexX_Cell, IndexY_Cell).Invert().ToColorP5js());
                                    }
                                    else {
                                        this.Graphic.stroke(this.Color.Invert().ToColorP5js());
                                    }

                                    this.Graphic.point(Pos2.X - 1, Pos2.Y - 1);
                                }
                                break;
                        }
                    }
                }

                if (this.MouseIsOnUI()) {
                    const IndexX_Cell = this.IndexX_(mouseX);
                    const IndexY_Cell = this.IndexY_(mouseY);
                    const Color_Cell = this.Photo.Get(IndexX_Cell, IndexY_Cell);

                    let Text = " X: " + IndexX_Cell.toString() + " Y: " + IndexY_Cell.toString() + " \n";

                    if (this.Photo.IndexIsOnPhoto(IndexX_Cell, IndexY_Cell)) {
                        Text += " R: " + Color_Cell.R.toString() + " G: " + Color_Cell.G.toString() + " B: " + Color_Cell.B.toString() + " A: " + Color_Cell.A.toString();
                    }
                    else {
                        Text += " R: --- G: --- B: --- A: ---";
                    }

                    this.Graphic.fill(255, 255);
                    this.Graphic.stroke(0, 63);
                    this.Graphic.strokeWeight(3);
                    this.Graphic.textAlign("left", "top");
                    this.Graphic.textSize(15);
                    this.Graphic.text(Text, 0, 0);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }

        if (!this.MouseIsOnUI() && (this.IsBeingRightDragged || this.IsBeingLeftDragged || this.IsBeingCenterDragged)) {
            this.ScrollBarX.IsBeingLeftDragged = true;
            this.ScrollBarX.Update();

            this.ScrollBarY.IsBeingLeftDragged = true;
            this.ScrollBarY.Update();
        }

        this.ScrollBarX.SetMinValue(-this.Photo.Width * 0.5);
        this.ScrollBarX.SetMaxValue(this.Photo.Width * 0.5);
        this.ScrollBarX.SetCurrentValue(this.ScrollBarX.CurrentValue);

        this.ScrollBarY.SetMinValue(-this.Photo.Height * 0.5);
        this.ScrollBarY.SetMaxValue(this.Photo.Height * 0.5);
        this.ScrollBarY.SetCurrentValue(this.ScrollBarY.CurrentValue);
    }
    IsRightPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.Index2s = [];
        this.Pos2s = [];

        if (this.MouseIsOnUI()) {
            if (PaintTools.length > 0) {
                if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                    this.IsBeingRightDragged = true;

                    this.EndIndexX = this.IndexX_(mouseX);
                    this.EndIndexY = this.IndexY_(mouseY);
                    this.LastEndIndexX = this.IndexX_(mouseX);
                    this.LastEndIndexY = this.IndexY_(mouseY);
                }
                else {
                    const IndexX_Cell = this.IndexX_(mouseX);
                    const IndexY_Cell = this.IndexY_(mouseY);

                    if (this.Photo.IndexIsOnPhoto(IndexX_Cell, IndexY_Cell)) {
                        ColorEditor_.Set(this.Photo.Get(IndexX_Cell, IndexY_Cell));
                    }
                }
            }
            else {
                alert("Select PaintTool.");
            }
        }
    }
    IsRightDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingRightDragged) {
            if (PaintTools.length > 0) {
                if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                    this.EndIndexX = this.IndexX_(mouseX);
                    this.EndIndexY = this.IndexY_(mouseY);

                    if (this.EndIndexX != this.LastEndIndexX || this.EndIndexY != this.LastEndIndexY) {
                        for (let i = 0; i < PaintTools[TabBarY_PaintTool.Index].Index2s.length; i++) {
                            PaintTools[TabBarY_PaintTool.Index].Index2s[i].X += (this.EndIndexX - this.LastEndIndexX);
                            PaintTools[TabBarY_PaintTool.Index].Index2s[i].Y += (this.EndIndexY - this.LastEndIndexY);
                        }

                        this.LastEndIndexX = this.IndexX_(mouseX);
                        this.LastEndIndexY = this.IndexY_(mouseY);
                    }
                }
            }
        }
    }
    IsRightReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.IsBeingRightDragged = false;
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingLeftDragged = true;

            if (PaintTools.length > 0) {
                this.StartIndexX = this.IndexX_(mouseX);
                this.StartIndexY = this.IndexY_(mouseY);
                this.EndIndexX = this.IndexX_(mouseX);
                this.EndIndexY = this.IndexY_(mouseY);
                this.LastEndIndexX = this.IndexX_(mouseX);
                this.LastEndIndexY = this.IndexY_(mouseY);
                const Radius = PaintTools[TabBarY_PaintTool.Index].Radius;
                if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                    PaintTools[TabBarY_PaintTool.Index].Photo = Photo.Empty;
                    PaintTools[TabBarY_PaintTool.Index].Index2s = [new Vector2Int(this.EndIndexX, this.EndIndexY)];
                }
                else {
                    switch (PaintTools[TabBarY_PaintTool.Index].PaintToolID) {
                        case PaintToolID_Pencil:
                            this.Photo.Set(FilledCircleAlgorithm(this.EndIndexX, this.EndIndexY, Radius), ColorEditor_.Label_Sample.Color.Copy());
                            break;
                        case PaintToolID_Brush:
                            this.Photo.GradatedSet(FilledCircleAlgorithm(this.EndIndexX, this.EndIndexY, Radius), this.EndIndexX, this.EndIndexY, Radius, (Radius + 1) * 3, ColorEditor_.Label_Sample.Color.Copy());
                            break;
                        case PaintToolID_Bucket:
                            this.Photo.Fill(this.EndIndexX, this.EndIndexY, ColorEditor_.Label_Sample.Color.Copy());
                            break;
                        case PaintToolID_Line:
                        case PaintToolID_Rect:
                        case PaintToolID_Circle:
                            this.Pos2s = [new Vector2Int(this.PosX_(this.EndIndexX), this.PosY_(this.EndIndexY))];
                            break;
                    }
                }
            }
            else {
                alert("Select PaintTool.");
            }
        }
    }
    IsLeftDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingLeftDragged) {
            if (PaintTools.length > 0) {
                this.EndIndexX = this.IndexX_(mouseX);
                this.EndIndexY = this.IndexY_(mouseY);
                const Radius = PaintTools[TabBarY_PaintTool.Index].Radius;
                if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                    PaintTools[TabBarY_PaintTool.Index].Index2s = [new Vector2Int(this.StartIndexX, this.StartIndexY), new Vector2Int(this.EndIndexX, this.EndIndexY)];
                }
                else {
                    if (this.EndIndexX != this.LastEndIndexX || this.EndIndexY != this.LastEndIndexY) {
                        switch (PaintTools[TabBarY_PaintTool.Index].PaintToolID) {
                            case PaintToolID_Pencil:
                                this.Index2s = LineAlgorithm(this.LastEndIndexX, this.LastEndIndexY, this.EndIndexX, this.EndIndexY);
                                for (let i = 0; i < this.Index2s.length; i++) {
                                    const Index2 = this.Index2s[i];

                                    this.Photo.Set(FilledCircleAlgorithm(Index2.X, Index2.Y, Radius), ColorEditor_.Label_Sample.Color.Copy());
                                }
                                break;
                            case PaintToolID_Brush:
                                this.Index2s = LineAlgorithm(this.LastEndIndexX, this.LastEndIndexY, this.EndIndexX, this.EndIndexY);
                                for (let i = 0; i < this.Index2s.length; i++) {
                                    const Index2 = this.Index2s[i];

                                    this.Photo.GradatedSet(FilledCircleAlgorithm(Index2.X, Index2.Y, Radius), Index2.X, Index2.Y, Radius, (Radius + 1) * 3, ColorEditor_.Label_Sample.Color.Copy());
                                }
                                break;
                            case PaintToolID_Bucket:
                                break;
                            case PaintToolID_Line:
                                this.Pos2s = LineAlgorithm(this.PosX_(this.StartIndexX), this.PosY_(this.StartIndexY), this.PosX_(this.EndIndexX), this.PosY_(this.EndIndexY));
                                break;
                            case PaintToolID_Rect:
                                this.Pos2s = RectAlgorithm(this.PosX_(this.StartIndexX), this.PosY_(this.StartIndexY), this.PosX_(this.EndIndexX), this.PosY_(this.EndIndexY));
                                break;
                            case PaintToolID_Circle:
                                this.Pos2s = [];
                                this.Pos2s = this.Pos2s.concat(CircleAlgorithm(this.PosX_(this.StartIndexX), this.PosY_(this.StartIndexY), floor(Mathf.Dist(this.PosX_(this.StartIndexX), this.PosY_(this.StartIndexY), this.PosX_(this.EndIndexX), this.PosY_(this.EndIndexY)))));
                                this.Pos2s = this.Pos2s.concat(LineAlgorithm(this.PosX_(this.StartIndexX), this.PosY_(this.StartIndexY), this.PosX_(this.EndIndexX), this.PosY_(this.EndIndexY)));
                                break;
                        }

                        this.LastEndIndexX = this.IndexX_(mouseX);
                        this.LastEndIndexY = this.IndexY_(mouseY);
                    }
                }
            }
        }
    }
    IsLeftReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingLeftDragged) {
            if (PaintTools.length > 0) {
                this.EndIndexX = this.IndexX_(mouseX);
                this.EndIndexY = this.IndexY_(mouseY);
                const Radius = PaintTools[TabBarY_PaintTool.Index].Radius;
                if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                }
                else {
                    switch (PaintTools[TabBarY_PaintTool.Index].PaintToolID) {
                        case PaintToolID_Pencil:
                        case PaintToolID_Brush:
                        case PaintToolID_Bucket:
                            break;
                        case PaintToolID_Line:
                            this.Index2s = LineAlgorithm(this.StartIndexX, this.StartIndexY, this.EndIndexX, this.EndIndexY);
                            for (let i = 0; i < this.Index2s.length; i++) {
                                const Index2 = this.Index2s[i];

                                this.Photo.Set(FilledCircleAlgorithm(Index2.X, Index2.Y, Radius), ColorEditor_.Label_Sample.Color.Copy());
                            }
                            break;
                        case PaintToolID_Rect:
                            this.Index2s = RectAlgorithm(this.StartIndexX, this.StartIndexY, this.EndIndexX, this.EndIndexY);
                            for (let i = 0; i < this.Index2s.length; i++) {
                                const Index2 = this.Index2s[i];

                                this.Photo.Set(FilledCircleAlgorithm(Index2.X, Index2.Y, Radius), ColorEditor_.Label_Sample.Color.Copy());
                            }
                            break;
                        case PaintToolID_Circle:
                            this.Index2s = CircleAlgorithm(this.StartIndexX, this.StartIndexY, floor(Mathf.Dist(this.StartIndexX, this.StartIndexY, this.EndIndexX, this.EndIndexY)))
                            for (let i = 0; i < this.Index2s.length; i++) {
                                const Index2 = this.Index2s[i];

                                this.Photo.Set(FilledCircleAlgorithm(Index2.X, Index2.Y, Radius), ColorEditor_.Label_Sample.Color.Copy());
                            }
                            break;
                    }

                    this.Save();
                }
            }
        }

        this.Index2s = [];
        this.Pos2s = [];

        this.IsBeingLeftDragged = false;
    }
    IsCenterPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            this.IsBeingCenterDragged = true;

            this.ScrollBarX.IsBeingLeftDragged = true;
            this.ScrollBarX.Update();

            this.ScrollBarY.IsBeingLeftDragged = true;
            this.ScrollBarY.Update();
        }
    }
    IsCenterDragged() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.IsBeingCenterDragged) {
            this.ScrollBarX.IsBeingLeftDragged = true;
            this.ScrollBarX.Update();

            this.ScrollBarY.IsBeingLeftDragged = true;
            this.ScrollBarY.Update();
        }
    }
    IsCenterReleased() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.ScrollBarX.IsBeingLeftDragged = false;

        this.ScrollBarY.IsBeingLeftDragged = false;

        this.IsBeingCenterDragged = false;
    }
    MouseScrolled(_Event) {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI() || this.IsBeingRightDragged || this.IsBeingLeftDragged || this.IsBeingCenterDragged) {
            if (this.InitialZoom > 1) {
                this.InitialZoom -= Math.sign(_Event.delta);

                this.InitialZoom = floor(this.InitialZoom);
            }
            else {
                this.InitialZoom -= Math.sign(_Event.delta) * 0.1;
            }

            this.InitialZoom = Mathf.Clamp(this.InitialZoom, MinZoom, MaxZoom);
        }
    }
    KeyPressed(_Key) {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        this.KeyStates[_Key] = true;

        if (this.KeyStates["Control"]) {
            if (this.KeyStates["s"]) {
                ModalMenu_Format.Open();
            }
            else if (this.KeyStates["z"]) {
                Undo_Photo();
            }
            else if (this.KeyStates["y"]) {
                Redo_Photo();
            }
        }

        if (PaintTools.length > 0) {
            if (PaintTools[TabBarY_PaintTool.Index].PaintToolID == PaintToolID_Select) {
                if (this.KeyStates["Control"]) {
                    if (this.KeyStates["a"]) {
                        PaintTools[TabBarY_PaintTool.Index].Index2s = FilledRectAlgorithm(0, 0, this.Photo.Width - 1, this.Photo.Height - 1);
                    }
                    if (this.KeyStates["g"]) {
                        if (PaintTools[TabBarY_PaintTool.Index].Index2s.length > 0) {
                            const MinIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X < Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MinIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y < Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;
                            const MaxIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X > Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MaxIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y > Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;

                            this.Photo.SelectedFill(MinIndexX, MinIndexY, MaxIndexX, MaxIndexY, ColorEditor_.Label_Sample.Color.Copy());

                            this.Save();
                        }
                    }
                    else if (this.KeyStates["c"]) {
                        if (PaintTools[TabBarY_PaintTool.Index].Index2s.length > 0) {
                            const MinIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X < Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MinIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y < Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;
                            const MaxIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X > Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MaxIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y > Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;

                            PaintTools[TabBarY_PaintTool.Index].Photo = this.Photo.Crop(MinIndexX, MinIndexY, MaxIndexX, MaxIndexY);
                            PaintTools[TabBarY_PaintTool.Index].Photo.Name = PaintTools[TabBarY_PaintTool.Index].Photo.Name + "_part"
                        }
                    }
                    else if (this.KeyStates["v"]) {
                        if (PaintTools[TabBarY_PaintTool.Index].Photo.HasData()) {
                            const MinIndexX = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.X < Item1.X ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).X;
                            const MinIndexY = PaintTools[TabBarY_PaintTool.Index].Index2s.reduce((Item1, Item2) => { return Item2.Y < Item1.Y ? Item2 : Item1; }, PaintTools[TabBarY_PaintTool.Index].Index2s[0]).Y;

                            this.Photo = this.Photo.Place(PaintTools[TabBarY_PaintTool.Index].Photo, MinIndexX, MinIndexY);

                            this.Save();
                        }
                    }
                    else if (this.KeyStates["d"]) {
                        if (PaintTools[TabBarY_PaintTool.Index].Photo.HasData()) {
                            const Photo_ = PaintTools[TabBarY_PaintTool.Index].Photo.Copy();

                            if (PhotoEditors.every(Item => Item.Photo.Name != Photo_.Name)) {
                                const PhotoEditor_ = new PhotoEditor(
                                    CornerPosX_PhotoEditor,
                                    CornerPosY_PhotoEditor,
                                    Width_PhotoEditor,
                                    Height_PhotoEditor,
                                    Color_LightGray,
                                    InitialZoom,
                                    Photo_,
                                    Photo_.Background()
                                );
                                PhotoEditor_.SetIsAvailable(false);
                                PhotoEditor_.PushUI(RenderQueue_General);
                                PhotoEditors.push(PhotoEditor_);
                                TabBarX_PhotoEditor.Add(PhotoEditor_.Photo.Name);

                                Update_PhotoEditor();

                                Socket.emit("Create_Image", Photo_.Name, Photo_.Type, Photo_.Width, Photo_.Height, CopyPrimitiveArray1D(Photo_.Data1D));
                            }
                            else {
                                alert("Image already exists.");
                            }
                        }
                    }
                }
            }
        }
    }
    KeyReleased(_Key) {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (_Key in this.KeyStates) {
            delete this.KeyStates[_Key];
        }
    }
    MouseOut() {
        this.IsBeingRightPressed = false;
        this.IsBeingRightDragged = false;
        this.IsBeingLeftPressed = false;
        this.IsBeingLeftDragged = false;
        this.IsBeingCenterPressed = false;
        this.IsBeingCenterDragged = false;

        this.IsRightReleased();
        this.IsLeftReleased();
        this.IsCenterReleased();

        if (PaintTools.length > 0) {
            PaintTools[TabBarY_PaintTool.Index].Index2s = [];
            PaintTools[TabBarY_PaintTool.Index].Pos2s = [];
        }
    }
    Save() {
        this.History.splice(this.HistoryIndex, 0, this.Photo.Copy());

        if (this.HistoryIndex != 0) {
            this.History.splice(0, this.HistoryIndex);

            this.HistoryIndex = 0;
        }

        if (this.History.length > MaxHistory) {
            this.History.splice(this.History.length - 1);
        }

        Socket.emit("Update_Image", this.Photo.Name, this.Photo.Type, this.Photo.Width, this.Photo.Height, CopyPrimitiveArray1D(this.Photo.Data1D));
    }

    Copy() {
        return new PhotoEditor(this.CornerPosX, this.CornerPosY, this.Width, this.Height, _this.Color.Copy(), this.InitialZoom, this.Photo.Copy(), this.BackgroundPhoto.Copy());
    }
    static get Empty() {
        return new PhotoEditor(CornerPosX_PhotoEditor, CornerPosY_PhotoEditor, Width_PhotoEditor, Height_PhotoEditor, Color_LightGray, InitialZoom, Photo.Empty, Photo.Empty);
    }

    IndexX_(_PosX) {
        const OffsetX = this.Width * 0.5 - (this.Photo.Width * 0.5) * this.InitialZoom;

        return floor((-OffsetX + (_PosX - this.CornerPosX) + this.ScrollBarX.CurrentValue * this.InitialZoom) / this.InitialZoom);
    }
    IndexY_(_PosY) {
        const OffsetY = this.Height * 0.5 - (this.Photo.Height * 0.5) * this.InitialZoom;

        return floor((-OffsetY + (_PosY - this.CornerPosY) + this.ScrollBarY.CurrentValue * this.InitialZoom) / this.InitialZoom);
    }
    PosX_(_IndexX) {
        const OffsetX = this.Width * 0.5 - (this.Photo.Width * 0.5) * this.InitialZoom;

        const PosX = OffsetX + _IndexX * this.InitialZoom - this.ScrollBarX.CurrentValue * this.InitialZoom + this.InitialZoom * 0.5;

        return PosX;
    }
    PosY_(_IndexY) {
        const OffsetY = this.Height * 0.5 - (this.Photo.Height * 0.5) * this.InitialZoom;

        const PosY = OffsetY + _IndexY * this.InitialZoom - this.ScrollBarY.CurrentValue * this.InitialZoom + this.InitialZoom * 0.5;

        return PosY;
    }
}
class Pallet extends UI {
    constructor(_Name, _CornerPosX, _CornerPosY, _Width, _Height, _Color, _Photo) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.Name = _Name;
        this.Photo = _Photo;
        this.CellWidth = this.Width / Columns_Pallet;
        this.CellHeight = this.Height / Rows_Pallet;
        this.Graphic.drawingContext.imageSmoothingEnabled = false;
        this.Graphic.drawingContext.mozPhotomoothingEnabled = false;
        this.Graphic.drawingContext.webkitPhotomoothingEnabled = false;
        this.Graphic.drawingContext.msPhotomoothingEnabled = false;
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //Pallet
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            if (this.Photo.HasData()) {
                this.Graphic.image(this.Photo.Graphic, 0, 0, this.Width, this.Height);

                this.Graphic.fill(this.Color.ToColorP5js());
                this.Graphic.noStroke();

                for (let i = 0; i < this.Photo.Width; i++) {
                    this.Graphic.rect(i * this.CellWidth, 0, 1, this.Height);
                }

                for (let i = 0; i < this.Photo.Height; i++) {
                    this.Graphic.rect(0, i * this.CellHeight, this.Width, 1);
                }
            }

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }
    }
    IsRightPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }

        if (this.MouseIsOnUI()) {
            if (Pallets.length > 0) {
                const IndexX_Cell = this.IndexX_(mouseX);
                const IndexY_Cell = this.IndexY_(mouseY);

                ColorEditor_.Set(this.Photo.Get(IndexX_Cell, IndexY_Cell));
            }
        }
    }
    IsLeftPressed() {
        if (!this.IsVisible || !this.IsAvailable) {
            return;
        }
        if (this.MouseIsOnUI()) {
            if (Pallets.length > 0) {
                const IndexX_Cell = this.IndexX_(mouseX);
                const IndexY_Cell = this.IndexY_(mouseY);

                this.Photo.Set([new Vector2Int(IndexX_Cell, IndexY_Cell)], ColorEditor_.Label_Sample.Color.Copy());
            }
        }
    }

    Copy() {
        return new Pallet(this.Name, this.CornerPosX, this.CornerPosY, this.Width, this.Height, this.Color.Copy(), this.Photo.Copy());
    }
    static get Empty() {
        return new Pallet("Empty", CornerPosX_Pallet, CornerPosY_Pallet, Width_Pallet, Height_Pallet, Color_LightGray, Photo.Empty);
    }
    static Index(_Photo) {
        const Colors = [];

        const Data2D_Photo = ToData2D(_Photo.Width, _Photo.Height, _Photo.Data1D);

        for (let i = 0; i < _Photo.Width; i++) {
            for (let j = 0; j < _Photo.Height; j++) {
                if (!Colors.some(Item => Item.IsEqual(Data2D_Photo[i][j]))) {
                    Colors.push(Data2D_Photo[i][j]);
                }
            }
        }

        const Data2D_Photo_ = CreateFilledArray2D(Columns_Pallet, Rows_Pallet, new Color(255, 255, 255, 255));
        for (let i = 0; i < Columns_Pallet; i++) {
            for (let j = 0; j < Rows_Pallet; j++) {
                const Index = i * Columns_Pallet + j;

                if (Index < Colors.length) {
                    Data2D_Photo_[i][j] = Colors[Index];
                }
            }
        }

        const Data1D_Photo = ToData1D(Columns_Pallet, Rows_Pallet, Data2D_Photo_);

        const Photo_ = new Photo("Index Color", "image/png", Columns_Pallet, Rows_Pallet, Data1D_Photo);

        return new Pallet("Index Color", CornerPosX_Pallet, CornerPosY_Pallet, Width_Pallet, Height_Pallet, Color_LightGray, Photo_);
    }

    IndexX_(_PosX) {
        return floor((_PosX - this.CornerPosX) / this.CellWidth);
    }
    IndexY_(_PosY) {
        return floor((_PosY - this.CornerPosY) / this.CellHeight);
    }
}
class ColorEditor extends UI {
    constructor(_CornerPosX, _CornerPosY, _Width, _Height, _Color, _TextSize, _ENTER1, _ENTER2) {
        super(_CornerPosX, _CornerPosY, _Width, _Height, _Color);
        this.TextSize = _TextSize;
        this.ENTER1 = _ENTER1;
        this.ENTER2 = _ENTER2;
        this.CellWidth = 30;
        this.CellHeight = 30;
        this.Label = new Label(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3,
            this.CellWidth,
            this.CellHeight,
            Color_White,
            "",
            0
        );
        this.UIs.push(this.Label);
        this.Label_Sample = new Label(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3,
            this.CellWidth,
            this.CellHeight,
            Color_DefaultColor,
            "",
            0
        );
        this.UIs.push(this.Label_Sample);
        this.InputField = new InputField(
            this.CornerPosX + Space_UI3 + this.Label_Sample.Width + Space_UI3,
            this.CornerPosY + Space_UI3,
            this.Width - Space_UI3 * 3 - this.CellWidth,
            this.CellHeight,
            Color_White,
            "",
            this.TextSize,
            TextType_Text,
            this.ENTER1
        );
        this.UIs.push(this.InputField);
        this.ScrollBarX_R = new ScrollBarX(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 0,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 4,
            Height_ScrollBarX,
            Color_DarkRed,
            0,
            0,
            255,
            0
        );
        this.UIs.push(this.ScrollBarX_R);
        this.ScrollBarX_G = new ScrollBarX(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 1,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 4,
            Height_ScrollBarX,
            Color_DarkGreen,
            0,
            0,
            255,
            0
        );
        this.UIs.push(this.ScrollBarX_G);
        this.ScrollBarX_B = new ScrollBarX(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 2,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 4,
            Height_ScrollBarX,
            Color_DarkBlue,
            0,
            0,
            255,
            0
        );
        this.UIs.push(this.ScrollBarX_B);
        this.ScrollBarX_A = new ScrollBarX(
            this.CornerPosX + Space_UI3,
            this.CornerPosY + Space_UI3 + this.CellHeight + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 3,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 4,
            Height_ScrollBarX,
            Color_DarkGray,
            255,
            0,
            255,
            0
        );
        this.UIs.push(this.ScrollBarX_A);
        this.InputField_R = new InputField(
            this.CornerPosX + Space_UI3 + this.ScrollBarX_R.Width + Space_UI1,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 0,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 1,
            Height_ScrollBarX,
            Color_White,
            "",
            this.TextSize,
            TextType_Number,
            this.ENTER2
        );
        this.UIs.push(this.InputField_R);
        this.InputField_G = new InputField(
            this.CornerPosX + Space_UI3 + this.ScrollBarX_G.Width + Space_UI1,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 1,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 1,
            Height_ScrollBarX,
            Color_White,
            "",
            this.TextSize,
            TextType_Number,
            this.ENTER2
        );
        this.UIs.push(this.InputField_G);
        this.InputField_B = new InputField(
            this.CornerPosX + Space_UI3 + this.ScrollBarX_B.Width + Space_UI1,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 2,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 1,
            Height_ScrollBarX,
            Color_White,
            "",
            this.TextSize,
            TextType_Number,
            this.ENTER2
        );
        this.UIs.push(this.InputField_B);
        this.InputField_A = new InputField(
            this.CornerPosX + Space_UI3 + this.ScrollBarX_A.Width + Space_UI1,
            this.CornerPosY + Space_UI3 + this.Label_Sample.Height + Space_UI3 + (Height_ScrollBarX + Space_UI1) * 3,
            (this.Width - Space_UI3 * 2 - Space_UI1) / 5 * 1,
            Height_ScrollBarX,
            Color_White,
            "",
            this.TextSize,
            TextType_Number,
            this.ENTER2
        );
        this.UIs.push(this.InputField_A);
        this.ScrollBarX_R.SetCurrentValue(this.Label_Sample.Color.R);
        this.ScrollBarX_G.SetCurrentValue(this.Label_Sample.Color.G);
        this.ScrollBarX_B.SetCurrentValue(this.Label_Sample.Color.B);
        this.ScrollBarX_A.SetCurrentValue(this.Label_Sample.Color.A);
        this.InputField_R.Text = String(this.Label_Sample.Color.R);
        this.InputField_G.Text = String(this.Label_Sample.Color.G);
        this.InputField_B.Text = String(this.Label_Sample.Color.B);
        this.InputField_A.Text = String(this.Label_Sample.Color.A);
        this.InputField.Text = this.Label_Sample.Color.ToColorHex();
    }

    Draw() {
        if (!this.IsVisible) {
            return;
        }

        //ColorEditor
        {
            this.Graphic.clear();
            this.Graphic.background(this.Color.ToColorP5js());

            image(this.Graphic, this.CornerPosX, this.CornerPosY);
        }

        this.Label_Sample.Color.R = floor(this.ScrollBarX_R.CurrentValue);
        this.Label_Sample.Color.G = floor(this.ScrollBarX_G.CurrentValue);
        this.Label_Sample.Color.B = floor(this.ScrollBarX_B.CurrentValue);
        this.Label_Sample.Color.A = floor(this.ScrollBarX_A.CurrentValue);

        if (!this.InputField_R.IsFocused) {
            this.InputField_R.Text = String(floor(this.ScrollBarX_R.CurrentValue));
        }
        if (!this.InputField_G.IsFocused) {
            this.InputField_G.Text = String(floor(this.ScrollBarX_G.CurrentValue));
        }
        if (!this.InputField_B.IsFocused) {
            this.InputField_B.Text = String(floor(this.ScrollBarX_B.CurrentValue));
        }
        if (!this.InputField_A.IsFocused) {
            this.InputField_A.Text = String(floor(this.ScrollBarX_A.CurrentValue));
        }

        if (!this.InputField.IsFocused) {
            this.InputField.Text = this.Label_Sample.Color.ToColorHex();
        }
    }
    Set(_Color) {
        this.Label_Sample.Color.R = floor(_Color.R);
        this.Label_Sample.Color.G = floor(_Color.G);
        this.Label_Sample.Color.B = floor(_Color.B);
        this.Label_Sample.Color.A = floor(_Color.A);

        this.ScrollBarX_R.SetCurrentValue(_Color.R);
        this.ScrollBarX_G.SetCurrentValue(_Color.G);
        this.ScrollBarX_B.SetCurrentValue(_Color.B);
        this.ScrollBarX_A.SetCurrentValue(_Color.A);

        this.InputField_R.Text = String(floor(_Color.R));
        this.InputField_G.Text = String(floor(_Color.G));
        this.InputField_B.Text = String(floor(_Color.B));
        this.InputField_A.Text = String(floor(_Color.A));

        this.InputField.Text = _Color.ToColorHex();
    }
}

let Canvas_Sketch;
const Width_Sketch = 1400;
const Height_Sketch = 800;

const Height_InputField = 50;

const Height_ScrollBarX = 15;

const Width_ScrollBarY = 15;

const Height_TabBarX = 30;

const Width_TabBarY = 30;

const Height_ButtonBarX = 30;

const Width_ButtonBarY = 30;

const Height_UI = 50;

const Space_UI1 = 3;
const Space_UI2 = 20;
const Space_UI3 = 10;
const Space_Tab = 1;
const Space_Text = 5;
const Space_Remove = 5;

const Width_PhotoEditor = 800;
const Height_PhotoEditor = 600;
const CornerPosX_PhotoEditor = (Width_Sketch - Width_PhotoEditor) * 0.5;
const CornerPosY_PhotoEditor = (Height_Sketch - Height_PhotoEditor) * 0.5;

const Width_MiniTool = Width_PhotoEditor;
const Height_MiniTool = 30;
const CornerPosX_MiniTool = CornerPosX_PhotoEditor;
const CornerPosY_MiniTool = CornerPosY_PhotoEditor + Height_PhotoEditor + Space_UI1 + Height_ScrollBarX + Space_UI1;

const Width_Pallet = 240;
const Height_Pallet = 240;
const CornerPosX_Pallet = CornerPosX_PhotoEditor + Width_PhotoEditor + Space_UI1 + Width_ScrollBarY + Space_UI2;
const CornerPosY_Pallet = CornerPosY_PhotoEditor;

const Width_PaintTool = 240;
const Height_PaintTool = 0;
const CornerPosX_PaintTool = CornerPosX_PhotoEditor - Space_UI2 - Width_PaintTool;
const CornerPosY_PaintTool = CornerPosY_PhotoEditor;

const Width_ColorEditor = 240;
const Height_ColorEditor = 130;
const CornerPosX_ColorEditor = CornerPosX_PhotoEditor + Width_PhotoEditor + Space_UI1 + Width_ScrollBarY + Space_UI2;
const CornerPosY_ColorEditor = CornerPosY_PhotoEditor + Height_Pallet + Space_UI2;

const Width_Tool = Width_Sketch;
const Height_Tool = 30;
const CornerPosX_Tool = 0;
const CornerPosY_Tool = 0;

const Width_ModalMenu = 600;
const Height_ModalMenu = 480;
const CornerPosX_ModalMenu = (Width_Sketch - Width_ModalMenu) * 0.5;
const CornerPosY_ModalMenu = (Height_Sketch - Height_ModalMenu) * 0.5;

const Width_CheckerPattern = 8;

const Width_Remove = 15;
const Height_Remove = 15;

const Columns_Pallet = 12;
const Rows_Pallet = 12;

const MinZoom = 0.1;
const MaxZoom = 30;
const InitialZoom = 10;

const MaxHistory = 30 + 1;
const MinWidth = 1;
const MaxWidth = 4096;
const MinDiameter = 1;
const MaxDiameter = 15;
const MinSize = 3;
const MaxSize = 5;
const MinLevel = 0;
const MaxLevel = 255;
const MinThreshold = 0;
const MaxThreshold = 255;

const TextType_Null = -1;
const TextType_Text = 0;
const TextType_Number = 1;

const PngFile_FullColor = new PngFile("/public/Files/Images/FullColor.png");
const PngFile_Empty = new PngFile("/public/Files/Images/Empty.png");
const PngFile_Untitled = new PngFile("/public/Files/Images/Untitled.png");

const Color_White = new Color(255, 255, 255, 255);
const Color_Black = new Color(0, 0, 0, 255);
const Color_LightRed = new Color(255, 127, 127, 255);
const Color_DarkRed = new Color(255, 63, 63, 255);
const Color_LightGreen = new Color(127, 255, 127, 255);
const Color_DarkGreen = new Color(63, 255, 63, 255);
const Color_LightBlue = new Color(127, 127, 255, 255);
const Color_DarkBlue = new Color(63, 63, 255, 255);
const Color_LightGray = new Color(191, 191, 191, 255);
const Color_DarkGray = new Color(127, 127, 127, 255);
const Color_LightShadow = new Color(0, 0, 0, 15);
const Color_DarkShadow = new Color(0, 0, 0, 63);
const Color_Invisible = new Color(0, 0, 0, 0);
const Color_Text = new Color(0, 0, 0, 255);
const Color_Remove = new Color(255, 63, 63, 255);
const Color_Select = new Color(63, 63, 255, 100);
const Color_DefaultColor = new Color(0, 0, 0, 255);
const Color_Background = new Color(240, 240, 240, 255);

const PaintToolID_Null = -1;
const PaintToolID_Pencil = 0;
const PaintToolID_Line = 1;
const PaintToolID_Rect = 2;
const PaintToolID_Circle = 3;
const PaintToolID_Brush = 4;
const PaintToolID_Bucket = 5;
const PaintToolID_Select = 6;

const PaintToolMap = new Map([
    [PaintToolID_Pencil, "Pencil"],
    [PaintToolID_Line, "Line"],
    [PaintToolID_Rect, "Rect"],
    [PaintToolID_Circle, "Circle"],
    [PaintToolID_Brush, "Brush"],
    [PaintToolID_Bucket, "Bucket"],
    [PaintToolID_Select, "Select"]
]);

const RenderQueue_General = 0;
const RenderQueue_Modal = 1;

let UIs = [];

let ButtonBarX_Tool;

let PhotoEditors = [];
let TabBarX_PhotoEditor;
let ModalMenu_CreateImage;
let PhotoEditor_Empty;

let Pallets = [];
let TabBarX_Pallet;
let ModalMenu_CreatePallet;
let Pallet_Empty;

let PaintTools = [];
let TabBarY_PaintTool;
let ModalMenu_CreatePaintTool;
let ModalMenu_Diameter;

let ButtonBarX_MiniTool;

let ColorEditor_;

let ModalMenu_File;
let ModalMenu_Edit;
let ModalMenu_Image;
let ModalMenu_Resize;
let ModalMenu_Filter;
let ModalMenu_Room;
let ModalMenu_CreateRoom;
let ModalMenu_JoinRoom;
let ModalMenu_Size;
let ModalMenu_Level;
let ModalMenu_Threshold;
let ModalMenu_Format;

const Socket = io();

let ID = null;
let Users = null;
let Rooms = null;

function setup() {
    Canvas_Sketch = createCanvas(Width_Sketch, Height_Sketch);
    Canvas_Sketch.parent("Parent");
    Canvas_Sketch.mouseOut(MouseOut);
    Canvas_Sketch.mouseOver(MouseOver);

    pixelDensity(1);

    //ModalMenu_CreateImage
    {
        ModalMenu_CreateImage = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Create Image",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Title",
            Color_White,
            "Untitled",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_CreateImage.UIs.push(UI_1);

        const UI_2 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 1,
            Width,
            Height_UI,
            Color_LightGray,
            "Width",
            Color_White,
            "32",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_CreateImage.UIs.push(UI_2);

        const UI_3 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 2,
            Width,
            Height_UI,
            Color_LightGray,
            "Height",
            Color_White,
            "32",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_CreateImage.UIs.push(UI_3);

        const UI_4 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Create"],
            20,
            function () {//SELECT
                const Name_Photo = ModalMenu_CreateImage.UIs[0].InputField.Text;

                const Type_Photo = "image/png";

                const Width_Photo = parseInt(ModalMenu_CreateImage.UIs[1].InputField.Text);

                const Height_Photo = parseInt(ModalMenu_CreateImage.UIs[2].InputField.Text);

                if (Name_Photo == "" || isNaN(Width_Photo) || isNaN(Height_Photo)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Width_Photo < MinWidth || Height_Photo < MinWidth) {
                    alert("Width and Height must be more than " + MinWidth + ".");
                    return;
                }

                if (Width_Photo > MaxWidth || Height_Photo > MaxWidth) {
                    alert("Width and Height must be less than " + MaxWidth + ".");
                    return;
                }

                const Data1D_Photo = CreateFilledArray1D(Width_Photo * Height_Photo * 4, 255);

                const Photo_ = new Photo(Name_Photo, Type_Photo, Width_Photo, Height_Photo, Data1D_Photo);

                if (PhotoEditors.every(Item => Item.Photo.Name != Photo_.Name)) {
                    const PhotoEditor_ = new PhotoEditor(
                        CornerPosX_PhotoEditor,
                        CornerPosY_PhotoEditor,
                        Width_PhotoEditor,
                        Height_PhotoEditor,
                        Color_LightGray,
                        InitialZoom,
                        Photo_,
                        Photo_.Background()
                    );
                    PhotoEditor_.SetIsAvailable(false);
                    PhotoEditor_.PushUI(RenderQueue_General);
                    PhotoEditors.push(PhotoEditor_);
                    TabBarX_PhotoEditor.Add(PhotoEditor_.Photo.Name);

                    Update_PhotoEditor();

                    ModalMenu_CreateImage.Remove();

                    Socket.emit("Create_Image", Photo_.Name, Photo_.Type, Photo_.Width, Photo_.Height, CopyPrimitiveArray1D(Photo_.Data1D));
                }
                else {
                    alert("Image already exists.");
                }
            }
        );
        ModalMenu_CreateImage.UIs.push(UI_4);

        ModalMenu_CreateImage.SetIsVisible(false);
        ModalMenu_CreateImage.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_CreatePallet
    {
        ModalMenu_CreatePallet = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Create Pallet",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Full Color", "Empty", "Index Color"],
            20,
            function () {//SELECT
                const Text = ModalMenu_CreatePallet.UIs[0].Texts[ModalMenu_CreatePallet.UIs[0].LastIndex];

                if (Text == "Full Color") {
                    const Pallet_ = new Pallet(
                        "Full Color",
                        CornerPosX_Pallet,
                        CornerPosY_Pallet,
                        Width_Pallet,
                        Height_Pallet,
                        Color_LightGray,
                        new Photo("Full Color", "image/png", PngFile_FullColor.Width, PngFile_FullColor.Height, PngFile_FullColor.Data1D)
                    );
                    Pallet_.PushUI(RenderQueue_General);
                    Pallets.push(Pallet_);
                    TabBarX_Pallet.Add(Pallet_.Name);
                }
                else if (Text == "Empty") {
                    const Pallet_ = new Pallet(
                        "Empty",
                        CornerPosX_Pallet,
                        CornerPosY_Pallet,
                        Width_Pallet,
                        Height_Pallet,
                        Color_LightGray,
                        new Photo("Empty", "image/png", PngFile_Empty.Width, PngFile_Empty.Height, PngFile_Empty.Data1D)
                    );
                    Pallet_.PushUI(RenderQueue_General);
                    Pallets.push(Pallet_);
                    TabBarX_Pallet.Add(Pallet_.Name);
                }
                else if (Text == "Index Color") {
                    if (PhotoEditors.length > 0) {
                        const Pallet_ = Pallet.Index(PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Copy());
                        Pallet_.PushUI(RenderQueue_General);
                        Pallets.push(Pallet_);
                        TabBarX_Pallet.Add(Pallet_.Name);
                    }
                    else {
                        alert("Image does not exist.");
                        return;
                    }
                }

                Update_Pallet();

                ModalMenu_CreatePallet.Remove();
            }
        );
        ModalMenu_CreatePallet.UIs.push(UI_1);

        ModalMenu_CreatePallet.SetIsVisible(false);
        ModalMenu_CreatePallet.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_CreatePaintTool
    {
        ModalMenu_CreatePaintTool = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Create PaintTool",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Pencil", "Line", "Rect", "Circle", "Brush", "Bucket", "Select"],
            20,
            function () {//SELECT
                const Text = ModalMenu_CreatePaintTool.UIs[0].Texts[ModalMenu_CreatePaintTool.UIs[0].LastIndex];

                if (Text == "Bucket") {
                    const PaintTool_ = new PaintTool(PaintToolID_Bucket, "Bucket", -1);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);

                    Update_PaintTool();

                    ModalMenu_CreatePaintTool.Remove();
                }
                else if (Text == "Select") {
                    const PaintTool_ = new PaintTool(PaintToolID_Select, "Select", -1);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);

                    Update_PaintTool();

                    ModalMenu_CreatePaintTool.Remove();
                }
                else {
                    ModalMenu_CreatePaintTool.Remove();

                    ModalMenu_Diameter.Text = Text;

                    ModalMenu_Diameter.Open();
                }
            }
        );
        ModalMenu_CreatePaintTool.UIs.push(UI_1);

        ModalMenu_CreatePaintTool.SetIsVisible(false);
        ModalMenu_CreatePaintTool.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Diameter
    {
        ModalMenu_Diameter = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Diameter",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Diameter",
            Color_White,
            "1",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Diameter.UIs.push(UI_1);

        const UI_2 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Create"],
            20,
            function () {//SELECT
                const Text = ModalMenu_CreatePaintTool.UIs[0].Texts[ModalMenu_CreatePaintTool.UIs[0].LastIndex];

                const Diameter = parseInt(ModalMenu_Diameter.UIs[0].InputField.Text);

                if (isNaN(Diameter)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Diameter < MinDiameter) {
                    alert("Diameter must be more than " + MinDiameter + ".");
                    return;
                }

                if (Diameter > MaxDiameter) {
                    alert("Diameter must be less than " + MaxDiameter + ".");
                    return;
                }

                if (Diameter % 2 == 0) {
                    alert("Diameter must be an odd number.");
                    return;
                }

                if (Text == "Pencil") {
                    const PaintTool_ = new PaintTool(PaintToolID_Pencil, "Pencil [" + Diameter + "]", Diameter);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);
                }
                else if (Text == "Line") {
                    const PaintTool_ = new PaintTool(PaintToolID_Line, "Line [" + Diameter + "]", Diameter);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);
                }
                else if (Text == "Rect") {
                    const PaintTool_ = new PaintTool(PaintToolID_Rect, "Rect [" + Diameter + "]", Diameter);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);
                }
                else if (Text == "Circle") {
                    const PaintTool_ = new PaintTool(PaintToolID_Circle, "Circle [" + Diameter + "]", Diameter);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);
                }
                else if (Text == "Brush") {
                    const PaintTool_ = new PaintTool(PaintToolID_Brush, "Brush [" + Diameter + "]", Diameter);
                    PaintTools.push(PaintTool_);
                    TabBarY_PaintTool.Add(PaintTool_.Name);
                }

                Update_PaintTool();

                ModalMenu_Diameter.Remove();
            }
        )
        ModalMenu_Diameter.UIs.push(UI_2);

        ModalMenu_Diameter.SetIsVisible(false);
        ModalMenu_Diameter.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Resize
    {
        ModalMenu_Resize = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Resize",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );
        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Width",
            Color_White,
            "",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Resize.UIs.push(UI_1);

        const UI_2 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 1,
            Width,
            Height_UI,
            Color_LightGray,
            "Height",
            Color_White,
            "",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Resize.UIs.push(UI_2);

        const UI_3 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Apply"],
            20,
            function () {//SELECT
                const Text = ModalMenu_Image.UIs[0].Texts[ModalMenu_Image.UIs[0].LastIndex];

                const Width_Photo = parseInt(ModalMenu_Resize.UIs[0].InputField.Text);

                const Height_Photo = parseInt(ModalMenu_Resize.UIs[1].InputField.Text);

                if (isNaN(Width_Photo) || isNaN(Height_Photo)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Width_Photo < MinWidth || Height_Photo < MinWidth) {
                    alert("Width and Height must be more than " + MinWidth + ".");
                    return;
                }

                if (Width_Photo > MaxWidth || Height_Photo > MaxWidth) {
                    alert("Width and Height must be less than " + MaxWidth + ".");
                    return;
                }

                if (Text == "Resize") {
                    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Resize(Width_Photo, Height_Photo);
                    PhotoEditors[TabBarX_PhotoEditor.Index].BackgroundPhoto = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Background();

                    PhotoEditors[TabBarX_PhotoEditor.Index].Save();
                }

                ModalMenu_Resize.Remove();
            }
        )
        ModalMenu_Resize.UIs.push(UI_3);

        ModalMenu_Resize.SetIsVisible(false);
        ModalMenu_Resize.PushUI(RenderQueue_Modal);

    }

    //ModalMenu_Size
    {
        ModalMenu_Size = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Size",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Size",
            Color_White,
            "3",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Size.UIs.push(UI_1);

        const UI_2 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Apply"],
            20,
            function () {//SELECT   
                const Text = ModalMenu_Filter.UIs[0].Texts[ModalMenu_Filter.UIs[0].LastIndex];

                const Size = parseInt(ModalMenu_Size.UIs[0].InputField.Text);

                if (isNaN(Size)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Size < MinSize) {
                    alert("Size must be more than " + MinSize + ".");
                    return;
                }

                if (Size > MaxSize) {
                    alert("Size must be less than " + MaxSize + ".");
                    return;
                }

                if (Size % 2 == 0) {
                    alert("Size must be an odd number.");
                    return;
                }

                if (Text == "Blur") {
                    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Blur(Size);

                    PhotoEditors[TabBarX_PhotoEditor.Index].Save();
                }

                ModalMenu_Size.Remove();
            }
        )
        ModalMenu_Size.UIs.push(UI_2);

        ModalMenu_Size.SetIsVisible(false);
        ModalMenu_Size.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Level
    {
        ModalMenu_Level = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Level",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Level",
            Color_White,
            "4",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Level.UIs.push(UI_1);

        const UI_2 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Apply"],
            20,
            function () {//SELECT   
                const Text = ModalMenu_Filter.UIs[0].Texts[ModalMenu_Filter.UIs[0].LastIndex];

                const Level = parseInt(ModalMenu_Level.UIs[0].InputField.Text);

                if (isNaN(Level)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Level < MinLevel) {
                    alert("Level must be more than " + MinLevel + ".");
                    return;
                }

                if (Level > MaxLevel) {
                    alert("Level must be less than " + MaxLevel + ".");
                    return;
                }

                if (Text == "Posterize") {
                    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Posterize(Level);

                    PhotoEditors[TabBarX_PhotoEditor.Index].Save();
                }

                ModalMenu_Level.Remove();
            }
        )
        ModalMenu_Level.UIs.push(UI_2);

        ModalMenu_Level.SetIsVisible(false);
        ModalMenu_Level.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Threshold
    {
        ModalMenu_Threshold = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Threshold",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Threshold",
            Color_White,
            "127",
            20,
            TextType_Number,
            function () {//ENTER
            }
        );
        ModalMenu_Threshold.UIs.push(UI_1);

        const UI_2 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Apply"],
            20,
            function () {//SELECT   
                const Text = ModalMenu_Filter.UIs[0].Texts[ModalMenu_Filter.UIs[0].LastIndex];

                const Threshold = parseInt(ModalMenu_Threshold.UIs[0].InputField.Text);

                if (isNaN(Threshold)) {
                    alert("All blanks must be filled in.");
                    return;
                }

                if (Threshold < MinThreshold) {
                    alert("Threshold must be more than " + MinThreshold + ".");
                    return;
                }

                if (Threshold > MaxThreshold) {
                    alert("Threshold must be less than " + MaxThreshold + ".");
                    return;
                }

                if (Text == "Binary") {
                    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Grayscale().Binary(Threshold);

                    PhotoEditors[TabBarX_PhotoEditor.Index].Save();
                }
                else if (Text == "Edge") {
                    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Grayscale().Edge().Binary(Threshold);

                    PhotoEditors[TabBarX_PhotoEditor.Index].Save();
                }

                ModalMenu_Threshold.Remove();
            }
        )
        ModalMenu_Threshold.UIs.push(UI_2);

        ModalMenu_Threshold.SetIsVisible(false);
        ModalMenu_Threshold.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_File
    {
        ModalMenu_File = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "File",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Import", "Export"],
            20,
            function () {//SELECT
                const Text = ModalMenu_File.UIs[0].Texts[ModalMenu_File.UIs[0].LastIndex];

                if (Text == "Import") {
                    Import_Photo();

                    ModalMenu_File.Remove();
                }
                else if (Text == "Export") {
                    if (PhotoEditors.length > 0) {
                        ModalMenu_File.Remove();

                        ModalMenu_Format.Open();
                    }
                    else {
                        alert("Image does not exist.");
                        return;
                    }
                }
            }
        );
        ModalMenu_File.UIs.push(UI_1);

        ModalMenu_File.SetIsVisible(false);
        ModalMenu_File.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Edit
    {
        ModalMenu_Edit = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Edit",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Undo", "Redo"],
            20,
            function () {//SELECT
                if (PhotoEditors.length > 0) {
                    const Text = ModalMenu_Edit.UIs[0].Texts[ModalMenu_Edit.UIs[0].LastIndex];

                    if (Text == "Undo") {
                        Undo_Photo();
                    }
                    else if (Text == "Redo") {
                        Redo_Photo();
                    }
                }
                else {
                    alert("Image does not exist.");
                    return;
                }

                ModalMenu_Edit.Remove();
            }
        );
        ModalMenu_Edit.UIs.push(UI_1);

        ModalMenu_Edit.SetIsVisible(false);
        ModalMenu_Edit.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Image
    {
        ModalMenu_Image = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Image",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Resize", "Rotate Right", "Rotate Left", "Flip Horizontally", "Flip Vertically"],
            20,
            function () {//SELECT
                if (PhotoEditors.length > 0) {
                    const Text = ModalMenu_Image.UIs[0].Texts[ModalMenu_Image.UIs[0].LastIndex];

                    if (Text == "Resize") {
                        ModalMenu_Image.Remove();

                        ModalMenu_Resize.Text = Text;

                        ModalMenu_Resize.UIs[0].InputField.Text = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Width.toString();
                        ModalMenu_Resize.UIs[1].InputField.Text = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Height.toString();

                        ModalMenu_Resize.Open();
                    }
                    else {
                        if (Text == "Rotate Right") {
                            PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.RotateRight();
                        }
                        else if (Text == "Rotate Left") {
                            PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.RotateLeft();
                        }
                        else if (Text == "Flip Horizontally") {
                            PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.FlipHorizontally();
                        }
                        else if (Text == "Flip Vertically") {
                            PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.FlipVertically();
                        }

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Image.Remove();
                    }
                }
                else {
                    alert("Image does not exist.");
                    return;
                }
            }
        );
        ModalMenu_Image.UIs.push(UI_1);

        ModalMenu_Image.SetIsVisible(false);
        ModalMenu_Image.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Filter
    {
        ModalMenu_Filter = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Filter",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Red", "Green", "Blue", "Grayscale", "Binary", "Invert", "Blur", "Posterize", "Edge", "Thin"],
            20,
            function () {//SELECT
                if (PhotoEditors.length > 0) {
                    const Text = ModalMenu_Filter.UIs[0].Texts[ModalMenu_Filter.UIs[0].LastIndex];

                    if (Text == "Red") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Red();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                    else if (Text == "Green") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Green();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                    else if (Text == "Blue") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Blue();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                    else if (Text == "Grayscale") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Grayscale();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                    else if (Text == "Binary") {
                        ModalMenu_Filter.Remove();

                        ModalMenu_Threshold.Text = Text;

                        ModalMenu_Threshold.Open();
                    }
                    else if (Text == "Invert") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Invert();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                    else if (Text == "Blur") {
                        ModalMenu_Filter.Remove();

                        ModalMenu_Size.Text = Text;

                        ModalMenu_Size.Open();
                    }
                    else if (Text == "Posterize") {
                        ModalMenu_Filter.Remove();

                        ModalMenu_Level.Text = Text;

                        ModalMenu_Level.Open();
                    }
                    else if (Text == "Edge") {
                        ModalMenu_Filter.Remove();

                        ModalMenu_Threshold.Text = Text;

                        ModalMenu_Threshold.Open();
                    }
                    else if (Text == "Thin") {
                        PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Thin();

                        PhotoEditors[TabBarX_PhotoEditor.Index].Save();

                        ModalMenu_Filter.Remove();
                    }
                }
                else {
                    alert("Image does not exist.");
                    return;
                }
            }
        );
        ModalMenu_Filter.UIs.push(UI_1);

        ModalMenu_Filter.SetIsVisible(false);
        ModalMenu_Filter.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Room
    {
        ModalMenu_Room = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Room",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["Create", "Join", "Leave"],
            20,
            function () {//SELECT
                const Text = ModalMenu_Room.UIs[0].Texts[ModalMenu_Room.UIs[0].LastIndex];

                if (Text == "Create") {
                    ModalMenu_Room.Remove();

                    ModalMenu_CreateRoom.Open();
                }
                else if (Text == "Join") {
                    ModalMenu_Room.Remove();

                    ModalMenu_JoinRoom.Open();
                }
                else if (Text == "Leave") {
                    ModalMenu_Room.Remove();

                    Users = null;
                    Rooms = null;

                    Socket.emit("Leave_Room");
                }
            }
        );
        ModalMenu_Room.UIs.push(UI_1);

        ModalMenu_Room.SetIsVisible(false);
        ModalMenu_Room.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_CreateRoom
    {
        ModalMenu_CreateRoom = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Create Room",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Name",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_CreateRoom.UIs.push(UI_1);

        const UI_2 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 1,
            Width,
            Height_UI,
            Color_LightGray,
            "Password",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_CreateRoom.UIs.push(UI_2);

        const UI_3 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 2,
            Width,
            Height_UI,
            Color_LightGray,
            "User Name",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_CreateRoom.UIs.push(UI_3);

        const UI_4 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Create"],
            20,
            function () {//SELECT
                const Name_Room = ModalMenu_CreateRoom.UIs[0].InputField.Text;

                const Password_Room = ModalMenu_CreateRoom.UIs[1].InputField.Text;

                const Name_User = ModalMenu_CreateRoom.UIs[2].InputField.Text;

                if (Name_Room == "" || Password_Room == "" || Name_User == "") {
                    alert("All blanks must be filled in.");
                    return;
                }

                ModalMenu_CreateRoom.Remove();

                Socket.emit("Create_Room", Name_Room, Password_Room, Name_User);
            }
        );
        ModalMenu_CreateRoom.UIs.push(UI_4);

        ModalMenu_CreateRoom.SetIsVisible(false);
        ModalMenu_CreateRoom.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_JoinRoom
    {
        ModalMenu_JoinRoom = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Join Room",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 0,
            Width,
            Height_UI,
            Color_LightGray,
            "Name",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_JoinRoom.UIs.push(UI_1);

        const UI_2 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 1,
            Width,
            Height_UI,
            Color_LightGray,
            "Password",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_JoinRoom.UIs.push(UI_2);

        const UI_3 = new LabeledInputField(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 2,
            Width,
            Height_UI,
            Color_LightGray,
            "User Name",
            Color_White,
            "",
            20,
            TextType_Text,
            function () {//ENTER
            }
        );
        ModalMenu_JoinRoom.UIs.push(UI_3);

        const UI_4 = new ButtonBarY(
            CornerPosX,
            CornerPosY + (Height_UI + Space_UI3) * 6,
            Width,
            Height_InputField,
            Color_LightGray,
            ["Join"],
            20,
            function () {//SELECT
                const Name_Room = ModalMenu_JoinRoom.UIs[0].InputField.Text;

                const Password_Room = ModalMenu_JoinRoom.UIs[1].InputField.Text;

                const Name_User = ModalMenu_JoinRoom.UIs[2].InputField.Text;

                if (Name_Room == "" || Password_Room == "" || Name_User == "") {
                    alert("All blanks must be filled in.");
                    return;
                }

                ModalMenu_JoinRoom.Remove();

                Socket.emit("Join_Room", Name_Room, Password_Room, Name_User);
            }
        );
        ModalMenu_JoinRoom.UIs.push(UI_4);

        ModalMenu_JoinRoom.SetIsVisible(false);
        ModalMenu_JoinRoom.PushUI(RenderQueue_Modal);
    }

    //ModalMenu_Format
    {
        ModalMenu_Format = new ModalMenu(
            CornerPosX_ModalMenu,
            CornerPosY_ModalMenu,
            Width_ModalMenu,
            Height_ModalMenu,
            Color_Background,
            "Format",
            Height_InputField * 0.5,
            [],
            function () {//REMOVE
            }
        );

        const CornerPosX = CornerPosX_ModalMenu + Space_UI3;
        const CornerPosY = CornerPosY_ModalMenu + 50 + Space_UI3;

        const Width = (Width_ModalMenu - Space_UI3 * 2);
        const Height = Height_ModalMenu - Height_UI - Space_UI3 * 2;

        const UI_1 = new ButtonBarY(
            CornerPosX,
            CornerPosY,
            Width,
            Height,
            Color_LightGray,
            ["PNG", "JPG", "JPEG", "WEBP"],
            20,
            function () {//SELECT
                const Text = ModalMenu_Format.UIs[0].Texts[ModalMenu_Format.UIs[0].LastIndex];

                Export_Photo("." + Text.toLowerCase());

                ModalMenu_Format.Remove();
            }
        );
        ModalMenu_Format.UIs.push(UI_1);

        ModalMenu_Format.SetIsVisible(false);
        ModalMenu_Format.PushUI(RenderQueue_Modal);
    }

    //TabBarX_PhotoEditor
    {
        TabBarX_PhotoEditor = new TabBarX(
            CornerPosX_PhotoEditor,
            CornerPosY_PhotoEditor - Height_TabBarX - Space_UI1,
            Width_PhotoEditor,
            Height_TabBarX,
            Color_LightGray,
            [],
            20,
            function () {//SELECT
                Update_PhotoEditor();
            },
            function () {//SWAP
                [PhotoEditors[TabBarX_PhotoEditor.StartIndex], PhotoEditors[TabBarX_PhotoEditor.EndIndex]] = [PhotoEditors[TabBarX_PhotoEditor.EndIndex], PhotoEditors[TabBarX_PhotoEditor.StartIndex]];

                Update_PhotoEditor();
            },
            function () {//ADD
                ModalMenu_CreateImage.Open();
            },
            function (_Index) {//REMOVE
                Socket.emit("Remove_Image", PhotoEditors[_Index].Photo.Name);

                if (PhotoEditors[_Index].Photo.Graphic != null) PhotoEditors[_Index].Photo.Graphic.remove();
                PhotoEditors[_Index].SetIsVisible(false);
                PhotoEditors.splice(_Index, 1);

                Update_PhotoEditor();
            }
        );
        TabBarX_PhotoEditor.PushUI(RenderQueue_General);

        const PhotoEditor_1 = new PhotoEditor(
            CornerPosX_PhotoEditor,
            CornerPosY_PhotoEditor,
            Width_PhotoEditor,
            Height_PhotoEditor,
            Color_LightGray,
            InitialZoom,
            Photo.Untitled,
            Photo.Untitled.Background()
        );
        PhotoEditor_1.PushUI(RenderQueue_General);
        PhotoEditors.push(PhotoEditor_1);
        TabBarX_PhotoEditor.Add(PhotoEditor_1.Photo.Name);

        PhotoEditor_Empty = PhotoEditor.Empty;
        PhotoEditor_Empty.PushUI(RenderQueue_General);
    }

    //TabBarX_Pallet
    {
        TabBarX_Pallet = new TabBarX(
            CornerPosX_Pallet,
            CornerPosY_Pallet - Height_TabBarX - Space_UI1,
            Width_Pallet,
            Height_TabBarX,
            Color_LightGray,
            [],
            20,
            function () {//SELECT
                Update_Pallet();
            },
            function () {//SWAP
                [Pallets[TabBarX_Pallet.StartIndex], Pallets[TabBarX_Pallet.EndIndex]] = [Pallets[TabBarX_Pallet.EndIndex], Pallets[TabBarX_Pallet.StartIndex]];

                Update_Pallet()
            },
            function () {//ADD
                ModalMenu_CreatePallet.Open();
            },
            function (_Index) {//REMOVE
                if (Pallets[_Index].Photo.Graphic != null) Pallets[_Index].Photo.Graphic.remove();
                Pallets[_Index].SetIsVisible(false);
                Pallets.splice(_Index, 1);

                Update_Pallet();
            }
        );
        TabBarX_Pallet.PushUI(RenderQueue_General);

        const Pallet_1 = new Pallet(
            "Full Color",
            CornerPosX_Pallet,
            CornerPosY_Pallet,
            Width_Pallet,
            Height_Pallet,
            Color_LightGray,
            new Photo("Full Color", "image/png", PngFile_FullColor.Width, PngFile_FullColor.Height, PngFile_FullColor.Data1D)
        );
        Pallet_1.PushUI(RenderQueue_General);
        Pallets.push(Pallet_1);
        TabBarX_Pallet.Add(Pallet_1.Name);

        Pallet_Empty = Pallet.Empty;
        Pallet_Empty.PushUI(RenderQueue_General);
    }

    //TabBarY_PaintTool
    {
        TabBarY_PaintTool = new TabBarY(
            CornerPosX_PaintTool,
            CornerPosY_PaintTool,
            Width_PaintTool,
            Height_PaintTool,
            Color_LightGray,
            [],
            20,
            function () {//SELECT
            },
            function () {//SWAP
                [PaintTools[TabBarY_PaintTool.StartIndex], PaintTools[TabBarY_PaintTool.EndIndex]] = [PaintTools[TabBarY_PaintTool.EndIndex], PaintTools[TabBarY_PaintTool.StartIndex]];
            },
            function () {//ADD
                ModalMenu_CreatePaintTool.Open();
            },
            function (_Index) {//REMOVE
                PaintTools.splice(_Index, 1);

                Update_PaintTool();
            }
        );
        TabBarY_PaintTool.PushUI(RenderQueue_General);

        const PaintTool_1 = new PaintTool(
            PaintToolID_Pencil,
            "Pencil [1]",
            1
        );
        PaintTools.push(PaintTool_1);
        TabBarY_PaintTool.Add(PaintTool_1.Name);

        const PaintTool_2 = new PaintTool(
            PaintToolID_Line,
            "Line [1]",
            1
        );
        PaintTools.push(PaintTool_2);
        TabBarY_PaintTool.Add(PaintTool_2.Name);

        const PaintTool_3 = new PaintTool(
            PaintToolID_Rect,
            "Rect [1]",
            1
        );
        PaintTools.push(PaintTool_3);
        TabBarY_PaintTool.Add(PaintTool_3.Name);

        const PaintTool_4 = new PaintTool(
            PaintToolID_Circle,
            "Circle [1]",
            1
        );
        PaintTools.push(PaintTool_4);
        TabBarY_PaintTool.Add(PaintTool_4.Name);

        const PaintTool_5 = new PaintTool(
            PaintToolID_Brush,
            "Brush [7]",
            7
        );
        PaintTools.push(PaintTool_5);
        TabBarY_PaintTool.Add(PaintTool_5.Name);

        const PaintTool_6 = new PaintTool(
            PaintToolID_Bucket,
            "Bucket",
            -1
        );
        PaintTools.push(PaintTool_6);
        TabBarY_PaintTool.Add(PaintTool_6.Name);

        const PaintTool_7 = new PaintTool(
            PaintToolID_Select,
            "Select",
            1
        );
        PaintTools.push(PaintTool_7);
        TabBarY_PaintTool.Add(PaintTool_7.Name);
    }

    //ButtonBarX_MiniTool
    {
        ButtonBarX_MiniTool = new ButtonBarX(
            CornerPosX_MiniTool,
            CornerPosY_MiniTool,
            Width_MiniTool,
            Height_MiniTool,
            Color_LightGray,
            ["Undo", "Redo", "Import", "Export"],
            20,
            function () {//SELECT
                const Text = ButtonBarX_MiniTool.Texts[ButtonBarX_MiniTool.LastIndex];

                if (Text == "Undo") {
                    if (PhotoEditors.length > 0) {
                        Undo_Photo();
                    }
                    else {
                        alert("Image does not exist.");
                        return;
                    }
                }
                else if (Text == "Redo") {
                    if (PhotoEditors.length > 0) {
                        Redo_Photo();
                    }
                    else {
                        alert("Image does not exist.");
                        return;
                    }
                }
                else if (Text == "Import") {
                    Import_Photo();
                }
                else if (Text == "Export") {
                    if (PhotoEditors.length > 0) {
                        ModalMenu_Format.Open();
                    }
                    else {
                        alert("Image does not exist.");
                        return;
                    }
                }
            }
        );
        ButtonBarX_MiniTool.PushUI(RenderQueue_General);
    }

    //ButtonBarX_Tool
    {
        ButtonBarX_Tool = new ButtonBarX(
            CornerPosX_Tool,
            CornerPosY_Tool,
            Width_Tool,
            Height_Tool,
            Color_LightGray,
            ["File", "Edit", "Image", "Filter", "Room"],
            20,
            function () {//SELECT
                const Text = ButtonBarX_Tool.Texts[ButtonBarX_Tool.LastIndex];

                if (Text == "File") {
                    ModalMenu_File.Open();
                }
                else if (Text == "Edit") {
                    ModalMenu_Edit.Open();
                }
                else if (Text == "Image") {
                    ModalMenu_Image.Open();
                }
                else if (Text == "Filter") {
                    ModalMenu_Filter.Open();
                }
                else if (Text == "Room") {
                    ModalMenu_Room.Open();
                }
            }
        );
        ButtonBarX_Tool.PushUI(RenderQueue_General);
    }

    //ColorEditor_
    {
        ColorEditor_ = new ColorEditor(
            CornerPosX_ColorEditor,
            CornerPosY_ColorEditor,
            Width_ColorEditor,
            Height_ColorEditor,
            Color_LightGray,
            15,
            function () {//ENTER1
                let Hex = ColorEditor_.InputField.Text;

                if (Hex == "" || Hex == "#") {
                    Hex = "#00000000";
                }
                else if (Hex.length > 9) {
                    Hex = Hex.substring(0, 9);
                }
                else if (Hex.length < 9) {
                    while (true) {
                        Hex += "0";

                        if (Hex.length == 9) {
                            break;
                        }
                    }
                }

                if (!(/^#[0-9a-fA-F]+$/.test(Hex))) {
                    alert("A hexadecimal color code must be entered.");
                    return;
                }

                const Dec = parseInt(Hex.substring(1), 16);

                const R = (Dec >> 24) & 255;
                const G = (Dec >> 16) & 255;
                const B = (Dec >> 8) & 255;
                const A = (Dec >> 0) & 255;

                const Color_ = new Color(R, G, B, A);

                ColorEditor_.Set(Color_);
            },
            function () {//ENTER2
                let R = parseInt(ColorEditor_.InputField_R.Text);
                let G = parseInt(ColorEditor_.InputField_G.Text);
                let B = parseInt(ColorEditor_.InputField_B.Text);
                let A = parseInt(ColorEditor_.InputField_A.Text);

                if (isNaN(R)) {
                    R = 0;
                }

                if (isNaN(G)) {
                    G = 0;
                }

                if (isNaN(B)) {
                    B = 0;
                }

                if (isNaN(A)) {
                    A = 0;
                }

                const Color_ = new Color(R, G, B, A);

                ColorEditor_.Set(Color_);
            }
        );
        ColorEditor_.PushUI(RenderQueue_General);
    }

    TabBarX_PhotoEditor.Index = 0;
    TabBarX_Pallet.Index = 0;
    TabBarY_PaintTool.Index = 0;

    Update_PhotoEditor();
    Update_Pallet();
    Update_PaintTool();
}
function draw() {
    background(Color_Background.ToColorP5js());

    for (let i = 0; i < UIs.length; i++) {
        for (let j = 0; j < UIs[i].length; j++) {
            UIs[i][j].Draw();
        }
    }

    if (ID != null && Users != null && Rooms != null) {
        if (ID in Users) {
            const RoomName = Users[ID].RoomName;

            for (let i = 0; i < Rooms[RoomName].IDs.length; i++) {
                if (Rooms[RoomName].IDs[i] == ID) {
                    continue;
                }

                if (!(Rooms[RoomName].IDs[i] in Users)) {
                    continue;
                }

                const UserName = Users[Rooms[RoomName].IDs[i]].UserName;
                const MouseX = Users[Rooms[RoomName].IDs[i]].MouseX;
                const MouseY = Users[Rooms[RoomName].IDs[i]].MouseY;
                const R = Users[Rooms[RoomName].IDs[i]].R;
                const G = Users[Rooms[RoomName].IDs[i]].G;
                const B = Users[Rooms[RoomName].IDs[i]].B;
                const A = Users[Rooms[RoomName].IDs[i]].A;

                fill(0, 255);
                stroke(0, 63);
                strokeWeight(3);
                textAlign("left", "center");
                textSize(15);
                text(UserName + "#" + Rooms[RoomName].IDs[i], MouseX + 10, MouseY - 10);
                fill(R, G, B, A);
                stroke(0, 63);
                strokeWeight(1);
                circle(MouseX, MouseY, 5);
            }
        }
    }

    if (MouseIsOnSketch()) {
        Socket.emit("Set_Mouse", mouseX, mouseY);
        Socket.emit("Set_Color", ColorEditor_.Label_Sample.Color.R, ColorEditor_.Label_Sample.Color.G, ColorEditor_.Label_Sample.Color.B, ColorEditor_.Label_Sample.Color.A);
    }
}
function mousePressed() {
    if (MouseIsOnSketch()) {
        for (let i = 0; i < UIs.length; i++) {
            for (let j = 0; j < UIs[i].length; j++) {
                if (mouseButton === RIGHT) {
                    UIs[i][j].IsRightPressed();
                }
                if (mouseButton === LEFT) {
                    UIs[i][j].IsLeftPressed();
                }
                if (mouseButton === CENTER) {
                    UIs[i][j].IsCenterPressed();
                }
            }
        }

        return false;
    }
}
function mouseDragged() {
    if (MouseIsOnSketch()) {
        for (let i = 0; i < UIs.length; i++) {
            for (let j = 0; j < UIs[i].length; j++) {
                if (mouseButton === RIGHT) {
                    UIs[i][j].IsRightDragged();
                }
                if (mouseButton === LEFT) {
                    UIs[i][j].IsLeftDragged();
                }
                if (mouseButton === CENTER) {
                    UIs[i][j].IsCenterDragged();
                }
            }
        }

        return false;
    }
}
function mouseReleased() {
    if (MouseIsOnSketch()) {
        for (let i = 0; i < UIs.length; i++) {
            for (let j = 0; j < UIs[i].length; j++) {
                if (mouseButton === RIGHT) {
                    UIs[i][j].IsRightReleased();
                }
                if (mouseButton === LEFT) {
                    UIs[i][j].IsLeftReleased();
                }
                if (mouseButton === CENTER) {
                    UIs[i][j].IsCenterReleased();
                }
            }
        }

        return false;
    }
}
function mouseWheel(_Event) {
    if (MouseIsOnSketch()) {
        for (let i = 0; i < UIs.length; i++) {
            for (let j = 0; j < UIs[i].length; j++) {
                UIs[i][j].MouseScrolled(_Event);
            }
        }

        return false;
    }
}
function keyPressed() {
    for (let i = 0; i < UIs.length; i++) {
        for (let j = 0; j < UIs[i].length; j++) {
            UIs[i][j].KeyPressed(key);
        }
    }

    return false;
}
function keyReleased() {
    for (let i = 0; i < UIs.length; i++) {
        for (let j = 0; j < UIs[i].length; j++) {
            UIs[i][j].KeyReleased(key);
        }
    }

    return false;
}
function MouseOut() {
    for (let i = 0; i < UIs.length; i++) {
        for (let j = 0; j < UIs[i].length; j++) {
            UIs[i][j].MouseOut();
        }
    }

    return false;
}
function MouseOver() {
    for (let i = 0; i < UIs.length; i++) {
        for (let j = 0; j < UIs[i].length; j++) {
            UIs[i][j].MouseOver();
        }
    }

    return false;
}

function Import_Photo() {
    document.getElementById("Import").click();
}
function Export_Photo(_Format) {
    const Graphic = createGraphics(PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Width, PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Height);
    Graphic.image(PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Graphic, 0, 0);
    Graphic.save(PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Name + _Format);
    if (Graphic != null) Graphic.remove();
}
function Undo_Photo() {
    PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex = Mathf.Clamp(PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex + 1, 0, PhotoEditors[TabBarX_PhotoEditor.Index].History.length - 1);

    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].History[PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex].Copy();
    PhotoEditors[TabBarX_PhotoEditor.Index].BackgroundPhoto = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Background();

    Socket.emit("Undo_Image", PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Name);
}
function Redo_Photo() {
    PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex = Mathf.Clamp(PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex - 1, 0, PhotoEditors[TabBarX_PhotoEditor.Index].History.length - 1);

    PhotoEditors[TabBarX_PhotoEditor.Index].Photo = PhotoEditors[TabBarX_PhotoEditor.Index].History[PhotoEditors[TabBarX_PhotoEditor.Index].HistoryIndex].Copy();
    PhotoEditors[TabBarX_PhotoEditor.Index].BackgroundPhoto = PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Background();

    Socket.emit("Redo_Image", PhotoEditors[TabBarX_PhotoEditor.Index].Photo.Name);
}

function Update_PhotoEditor() {
    if (PhotoEditors.length > 0) {
        PhotoEditor_Empty.SetIsVisible(false);
        PhotoEditor_Empty.SetIsAvailable(false);

        for (let i = 0; i < PhotoEditors.length; i++) {
            PhotoEditors[i].SetIsVisible(i == TabBarX_PhotoEditor.Index);
            PhotoEditors[i].SetIsAvailable(i == TabBarX_PhotoEditor.Index);
        }
    }
    else {
        PhotoEditor_Empty.SetIsVisible(true);
        PhotoEditor_Empty.SetIsAvailable(true);

        for (let i = 0; i < PhotoEditors.length; i++) {
            PhotoEditors[i].SetIsVisible(false);
            PhotoEditors[i].SetIsAvailable(false);
        }
    }
}
function Update_Pallet() {
    if (Pallets.length > 0) {
        Pallet_Empty.SetIsVisible(false);
        Pallet_Empty.SetIsAvailable(false);

        for (let i = 0; i < Pallets.length; i++) {
            Pallets[i].SetIsVisible(i == TabBarX_Pallet.Index);
            Pallets[i].SetIsAvailable(i == TabBarX_Pallet.Index);
        }
    }
    else {
        Pallet_Empty.SetIsVisible(true);
        Pallet_Empty.SetIsAvailable(true);

        for (let i = 0; i < Pallets.length; i++) {
            Pallets[i].SetIsVisible(false);
            Pallets[i].SetIsAvailable(false);
        }
    }
}
function Update_PaintTool() {
    TabBarY_PaintTool.Height = Height_UI * (TabBarY_PaintTool.Texts.length + 1);

    if (TabBarY_PaintTool.Graphic != null) TabBarY_PaintTool.Graphic.remove();
    TabBarY_PaintTool.Graphic = createGraphics(TabBarY_PaintTool.Width - 1, TabBarY_PaintTool.Height - 1);

    TabBarY_PaintTool.TabHeight = TabBarY_PaintTool.Height / (TabBarY_PaintTool.Texts.length + 1);

    TabBarY_PaintTool.TabGraphics = new Array(TabBarY_PaintTool.Texts.length);
    TabBarY_PaintTool.TextGraphics = new Array(TabBarY_PaintTool.Texts.length);
    for (let i = 0; i < TabBarY_PaintTool.Texts.length; i++) {
        if (TabBarY_PaintTool.TabGraphics[i] != null) TabBarY_PaintTool.TabGraphics[i].remove();
        TabBarY_PaintTool.TabGraphics[i] = createGraphics(TabBarY_PaintTool.TabWidth, TabBarY_PaintTool.TabHeight - Space_Tab);
        if (TabBarY_PaintTool.TextGraphics[i] != null) TabBarY_PaintTool.TextGraphics[i].remove();
        TabBarY_PaintTool.TextGraphics[i] = createGraphics(TabBarY_PaintTool.TabWidth - Width_Remove - Space_Text, TabBarY_PaintTool.TabHeight);
    }
    if (TabBarY_PaintTool.AddGraphic != null) TabBarY_PaintTool.AddGraphic.remove();
    TabBarY_PaintTool.AddGraphic = createGraphics(TabBarY_PaintTool.TabWidth, TabBarY_PaintTool.TabHeight - Space_Tab);
}

function Clear_FilePath() {
    const Import = document.getElementById("Import");

    Import.value = null;
}
function Load_Files() {
    const Import = document.getElementById("Import");

    for (let i = 0; i < Import.files.length; i++) {
        const File = Import.files[i];

        const FileReader_ = new FileReader();
        FileReader_.readAsDataURL(File);
        FileReader_.onload = function (_Event) {
            const Image_ = new Image();
            Image_.src = _Event.target.result;
            Image_.crossOrigin = "Anonymous";

            Image_.onload = function () {
                const Canvas = document.createElement("canvas");
                Canvas.width = Image_.width;
                Canvas.height = Image_.height;

                const Context = Canvas.getContext("2d");

                Context.drawImage(Image_, 0, 0);

                const ImageData = Context.getImageData(0, 0, Image_.width, Image_.height);

                const Name_Photo = File.name.substring(0, File.name.lastIndexOf("."));

                const Type_Photo = File.type;

                const Width_Photo = Image_.width;

                const Height_Photo = Image_.height;

                if (Width_Photo > MaxWidth || Height_Photo > MaxWidth) {
                    alert("Width and Height must be less than " + MaxWidth + ".");
                }
                else if (Width_Photo < MinWidth || Height_Photo < MinWidth) {
                    alert("Width and Height must be less than " + MaxWidth + ".");
                }
                else {
                    const Data1D_Photo = ImageData.data;

                    const Photo_ = new Photo(Name_Photo, Type_Photo, Width_Photo, Height_Photo, Data1D_Photo);

                    if (PhotoEditors.every(Item => Item.Photo.Name != Photo_.Name)) {
                        const PhotoEditor_ = new PhotoEditor(
                            CornerPosX_PhotoEditor,
                            CornerPosY_PhotoEditor,
                            Width_PhotoEditor,
                            Height_PhotoEditor,
                            Color_LightGray,
                            InitialZoom,
                            Photo_,
                            Photo_.Background()
                        );
                        PhotoEditor_.SetIsAvailable(false);
                        PhotoEditor_.PushUI(RenderQueue_General);
                        PhotoEditors.push(PhotoEditor_);
                        TabBarX_PhotoEditor.Add(PhotoEditor_.Photo.Name);

                        Socket.emit("Create_Image", Photo_.Name, Photo_.Type, Photo_.Width, Photo_.Height, CopyPrimitiveArray1D(Photo_.Data1D));
                    }
                    else {
                        alert("Image already exists.");
                    }
                }

                Update_PhotoEditor();
            };
        };
    }
}

function LineAlgorithm(_StartPosX, _StartPosY, _EndPosX, _EndPosY) {
    let DiffX = Math.abs(_EndPosX - _StartPosX);
    let DiffY = Math.abs(_EndPosY - _StartPosY);

    const Slope = DiffY > DiffX;

    if (Slope) {
        [_StartPosX, _StartPosY] = [_StartPosY, _StartPosX];
        [_EndPosX, _EndPosY] = [_EndPosY, _EndPosX];
    }

    if (_StartPosX > _EndPosX) {
        [_StartPosX, _EndPosX] = [_EndPosX, _StartPosX];
        [_StartPosY, _EndPosY] = [_EndPosY, _StartPosY];
    }

    DiffX = abs(_EndPosX - _StartPosX);
    DiffY = abs(_EndPosY - _StartPosY);

    let Error = DiffX * 0.5;

    const Step = _StartPosY < _EndPosY ? 1 : -1;

    const Vec2s = [];

    let Y = _StartPosY;
    for (let X = _StartPosX; X <= _EndPosX; X++) {
        Vec2s.push(Slope ? new Vector2Int(Y, X) : new Vector2Int(X, Y));

        Error -= DiffY;

        if (Error < 0) {
            Error += DiffX;

            Y += Step;
        }
    }

    return Vec2s;
}
function RectAlgorithm(_StartPosX, _StartPosY, _EndPosX, _EndPosY) {
    const Vec2s = [];

    for (let i = Math.min(_StartPosX, _EndPosX); i <= Math.max(_StartPosX, _EndPosX); i++) {
        Vec2s.push(new Vector2Int(i, _StartPosY));
        Vec2s.push(new Vector2Int(i, _EndPosY));
    }

    for (let i = Math.min(_StartPosY, _EndPosY) + 1; i <= Math.max(_StartPosY, _EndPosY) - 1; i++) {
        Vec2s.push(new Vector2Int(_StartPosX, i));
        Vec2s.push(new Vector2Int(_EndPosX, i));
    }

    return Vec2s;
}
function FilledRectAlgorithm(_StartPosX, _StartPosY, _EndPosX, _EndPosY) {
    const Vec2s = [];

    for (let i = Math.min(_StartPosX, _EndPosX); i <= Math.max(_StartPosX, _EndPosX); i++) {
        for (let j = Math.min(_StartPosY, _EndPosY); j <= Math.max(_StartPosY, _EndPosY); j++) {
            Vec2s.push(new Vector2Int(i, j));
        }
    }

    return Vec2s;
}
function CircleAlgorithm(_CenterPosX, _CenterPosY, _Radius) {
    if (_Radius == 0) {
        return [new Vector2Int(_CenterPosX, _CenterPosY)];
    }

    let X = _Radius;
    let Y = 0;
    let Dist = 3 - _Radius * 2;
    let DiffX = 4 * (1 - X);
    let DiffY = 6;

    const Vec2s = [];

    while (true) {
        Vec2s.push(new Vector2Int(_CenterPosX + X, _CenterPosY + Y));
        Vec2s.push(new Vector2Int(_CenterPosX + X, _CenterPosY - Y));
        Vec2s.push(new Vector2Int(_CenterPosX - X, _CenterPosY + Y));
        Vec2s.push(new Vector2Int(_CenterPosX - X, _CenterPosY - Y));
        Vec2s.push(new Vector2Int(_CenterPosX + Y, _CenterPosY + X));
        Vec2s.push(new Vector2Int(_CenterPosX + Y, _CenterPosY - X));
        Vec2s.push(new Vector2Int(_CenterPosX - Y, _CenterPosY + X));
        Vec2s.push(new Vector2Int(_CenterPosX - Y, _CenterPosY - X));

        if (Dist > 0) {
            if (Y > X) {
                break;
            }

            X--;
            Dist += DiffX;
            DiffX += 4;
        }

        Y++;
        Dist += DiffY;
        DiffY += 4;
    }

    return Vec2s;
}
function FilledCircleAlgorithm(_CenterPosX, _CenterPosY, _Radius) {
    if (_Radius == 0) {
        return [new Vector2Int(_CenterPosX, _CenterPosY)];
    }

    let X = _Radius;
    let Y = 0;
    let Dist = 3 - _Radius * 2;
    let DiffX = 4 * (1 - X);
    let DiffY = 6;

    const Vec2s = [];

    while (true) {
        // Index2s.push(new Vector2Int(_CenterPosX + X, _CenterPosY + Y));
        // Index2s.push(new Vector2Int(_CenterPosX + X, _CenterPosY - Y));
        // Index2s.push(new Vector2Int(_CenterPosX - X, _CenterPosY + Y));
        // Index2s.push(new Vector2Int(_CenterPosX - X, _CenterPosY - Y));
        // Index2s.push(new Vector2Int(_CenterPosX + Y, _CenterPosY + X));
        // Index2s.push(new Vector2Int(_CenterPosX + Y, _CenterPosY - X));
        // Index2s.push(new Vector2Int(_CenterPosX - Y, _CenterPosY + X));
        // Index2s.push(new Vector2Int(_CenterPosX - Y, _CenterPosY - X));

        for (let i = _CenterPosX - X; i <= _CenterPosX + X; i++) {
            Vec2s.push(new Vector2Int(i, _CenterPosY + Y));
            Vec2s.push(new Vector2Int(i, _CenterPosY - Y));
        }

        for (let i = _CenterPosY - X; i <= _CenterPosY + X; i++) {
            Vec2s.push(new Vector2Int(_CenterPosX + Y, i));
            Vec2s.push(new Vector2Int(_CenterPosX - Y, i));
        }

        if (Dist > 0) {
            if (Y > X) {
                break;
            }

            X--;
            Dist += DiffX;
            DiffX += 4;
        }

        Y++;
        Dist += DiffY;
        DiffY += 4;

        if (Y == 8) {
            break;
        }
    }

    return Vec2s;
}

function TargetPosIsOnRectangle(_StartPosX, _StartPosY, _EndPosX, _EndPosY, _TargetPosX, _TargetPosY) {
    const MinX = Math.min(_StartPosX, _EndPosX);
    const MinY = Math.min(_StartPosY, _EndPosY);
    const MaxX = Math.max(_StartPosX, _EndPosX);
    const MaxY = Math.max(_StartPosY, _EndPosY);

    return MinX <= _TargetPosX && _TargetPosX <= MaxX && MinY <= _TargetPosY && _TargetPosY <= MaxY;
}

function MouseIsOnSketch() {
    return -1 < mouseX && mouseX < Width_Sketch && -1 < mouseY && mouseY < Height_Sketch;
}

function ToData2D(_Width, _Height, _Data1D) {
    const Data2D = CreateFilledArray2D(_Width, _Height, undefined);
    for (let i = 0; i < _Width; i++) {
        for (let j = 0; j < _Height; j++) {
            const Index = (_Width * j + i) * 4;

            const R = _Data1D[Index + 0];
            const G = _Data1D[Index + 1];
            const B = _Data1D[Index + 2];
            const A = _Data1D[Index + 3];

            Data2D[i][j] = new Color(R, G, B, A);
        }
    }

    return Data2D;
}
function ToData1D(_Width, _Height, _Data2D) {
    const Data1D = new Array(_Width * _Height * 4);
    for (let i = 0; i < _Width; i++) {
        for (let j = 0; j < _Height; j++) {
            const Index = (_Width * j + i) * 4;

            Data1D[Index + 0] = _Data2D[i][j].R;
            Data1D[Index + 1] = _Data2D[i][j].G;
            Data1D[Index + 2] = _Data2D[i][j].B;
            Data1D[Index + 3] = _Data2D[i][j].A;
        }
    }

    return Data1D;
}

function CreateFilledArray1D(_Length, _Item) {
    return Array.from({ length: _Length }, () => _Item);
}
function CreateFilledArray2D(_Columns, _Rows, _Item) {
    return Array.from({ length: _Columns }, () => Array(_Rows).fill(_Item));
}
function CopyPrimitiveArray1D(_Array) {
    const Array_ = new Array(_Array.length);

    for (let i = 0; i < _Array.length; i++) {
        Array_[i] = _Array[i];
    }

    return Array_;
}

Socket.on("connect", function () {
    Socket.emit("Setup");
});

Socket.on("ID", function (_ID) {
    ID = _ID;
});
Socket.on("Users", function (_Users) {
    Users = _Users;
});
Socket.on("Rooms", function (_Rooms) {
    Rooms = _Rooms;
});

Socket.on("Create_Room", function () {

});
Socket.on("Join_Room", function () {

});

Socket.on("Create_Image", function (_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D) {
    const Photo_ = new Photo(_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D);

    const PhotoEditor_ = new PhotoEditor(
        CornerPosX_PhotoEditor,
        CornerPosY_PhotoEditor,
        Width_PhotoEditor,
        Height_PhotoEditor,
        Color_LightGray,
        InitialZoom,
        Photo_,
        Photo_.Background()
    );
    PhotoEditor_.SetIsAvailable(false);
    PhotoEditor_.PushUI(RenderQueue_General);
    PhotoEditors.push(PhotoEditor_);
    TabBarX_PhotoEditor.Add(PhotoEditor_.Photo.Name);

    Update_PhotoEditor();
});
Socket.on("Update_Image", function (_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D) {
    const Photo_ = new Photo(_PhotoName, _PhotoType, _PhotoWidth, _PhotoHeight, _PhotoData1D);

    for (let i = 0; i < PhotoEditors.length; i++) {
        if (PhotoEditors[i].Photo.Name == _PhotoName) {
            PhotoEditors[i].Photo = Photo_;
            PhotoEditors[i].BackgroundPhoto = Photo_.Background();

            PhotoEditors[i].History.splice(PhotoEditors[i].HistoryIndex, 0, PhotoEditors[i].Photo.Copy());

            if (PhotoEditors[i].HistoryIndex != 0) {
                PhotoEditors[i].History.splice(0, PhotoEditors[i].HistoryIndex);

                PhotoEditors[i].HistoryIndex = 0;
            }

            if (PhotoEditors[i].History.length > MaxHistory) {
                PhotoEditors[i].History.splice(PhotoEditors[i].History.length - 1);
            }

            break;
        }
    }
});
Socket.on("Undo_Image", function (_PhotoName) {
    for (let i = 0; i < PhotoEditors.length; i++) {
        if (PhotoEditors[i].Photo.Name == _PhotoName) {
            PhotoEditors[i].HistoryIndex = Mathf.Clamp(PhotoEditors[i].HistoryIndex + 1, 0, PhotoEditors[i].History.length - 1);

            PhotoEditors[i].Photo = PhotoEditors[i].History[PhotoEditors[i].HistoryIndex].Copy();
            PhotoEditors[i].BackgroundPhoto = PhotoEditors[i].Photo.Background();

            break;
        }
    }
});
Socket.on("Redo_Image", function (_PhotoName) {
    for (let i = 0; i < PhotoEditors.length; i++) {
        if (PhotoEditors[i].Photo.Name == _PhotoName) {
            PhotoEditors[i].HistoryIndex = Mathf.Clamp(PhotoEditors[i].HistoryIndex - 1, 0, PhotoEditors[i].History.length - 1);

            PhotoEditors[i].Photo = PhotoEditors[i].History[PhotoEditors[i].HistoryIndex].Copy();
            PhotoEditors[i].BackgroundPhoto = PhotoEditors[i].Photo.Background();

            break;
        }
    }
});
Socket.on("Remove_Image", function (_PhotoName) {
    for (let i = 0; i < PhotoEditors.length; i++) {
        if (PhotoEditors[i].Photo.Name == _PhotoName) {
            TabBarX_PhotoEditor.Remove(i);
            TabBarX_PhotoEditor.REMOVE(i);

            Update_PhotoEditor();

            break;
        }
    }
});

Socket.on("Alert", function (_Text) {
    alert(_Text);
});