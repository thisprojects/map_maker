interface IDrawringTipsProps {
  isDrawingWall: boolean;
  isDrawingFloor: boolean;
}

const DrawingTips = ({ isDrawingWall, isDrawingFloor }: IDrawringTipsProps) => {
  return (
    <>
      {isDrawingWall && (
        <div className="absolute top-24 left-10 text-white bg-black bg-opacity-70 p-2 rounded">
          Click to place the end of the wall (45° angles only)
        </div>
      )}

      {isDrawingFloor && (
        <div className="absolute top-24 left-10 text-white bg-black bg-opacity-70 p-2 rounded">
          Click and drag to set floor dimensions
        </div>
      )}
    </>
  );
};

export default DrawingTips;
