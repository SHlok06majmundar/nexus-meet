import CallList from "@/components/CallList";

const PreviousPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-purple-1 to-pink-1 p-3 rounded-xl">
          <span className="text-2xl">📞</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-3 to-pink-3 bg-clip-text text-transparent">
          Previous Calls
        </h1>
      </div>

      <CallList type="ended" />
    </section>
  );
};

export default PreviousPage;
