interface MessageAttachmentsProps {
  attachments: { url: string; type: string }[];
}

export const MessageAttachments = ({
  attachments,
}: MessageAttachmentsProps) => {
  const count = attachments.length;

  if (count === 0) return null;

  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count >= 3) return "grid-cols-2";
    return "grid-cols-2";
  };

  return (
    <div
      className={`mt-2 mb-1 grid gap-1 overflow-hidden rounded-lg ${getGridClass()}`}
    >
      {attachments.map((file, index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-gray-100 ${
            count === 3 && index === 0 ? "col-span-2 h-40" : "h-32"
          }`}
        >
          <img
            src={file.url}
            alt="Attachment"
            className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
            onClick={() => window.open(file.url, "_blank")}
          />
        </div>
      ))}
    </div>
  );
};
