import ChatLogo from "./ChatLogo";

export const Message = ({ isAI, content, sources }) => (
  <div className="flex items-start gap-3">
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full ${
        isAI ? "bg-[#00A67E]" : "bg-[#E4E7EC]"
      } flex items-center justify-center`}
    >
      {isAI ? <ChatLogo /> : <span className="text-sm font-medium">S</span>}
    </div>
    <div className="flex-1">
      <p className=" text-gray-900 leading-relaxed">{content}</p>
    </div>
  </div>
);
