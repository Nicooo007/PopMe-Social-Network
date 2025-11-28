import chick from "../assets/image.png";

export default function CollectionsTitle() {
  return (
    <h1 className="text-5xl font-bold text-white flex items-center justify-center">
      C
      <span className="relative mx-1">
        <img
          src={chick}
          alt="chick"
          className="w-12 h-12 object-contain inline-block"
        />
      </span>
      LLECTIONS
    </h1>
  );
}