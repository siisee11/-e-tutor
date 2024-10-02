export default function IPhoneFrame({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-[375px] h-[812px] bg-black rounded-[60px] shadow-xl overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[200px] h-[30px] bg-black rounded-b-[20px] z-[500]"></div>
        <div className="absolute top-[10px] right-[65px] w-[10px] h-[10px] bg-gray-800 rounded-full z-[500]"></div>
        <div className="relative w-full h-full bg-white overflow-clip">
          {children}
        </div>
      </div>
    </div>
  );
}
