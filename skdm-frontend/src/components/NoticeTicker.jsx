import { useEffect, useState } from "react";
import { notices as staticNotices } from "../data/collegeData";
import { noticesApi } from "../services/api";

export default function NoticeTicker() {
  const [noticeList, setNoticeList] = useState(staticNotices);

  useEffect(() => {
    noticesApi.getAll()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((n) => ({
            tag: n.tag || "Notice",
            title: n.title,
          }));
          setNoticeList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const items = [...noticeList, ...noticeList]; // duplicate for seamless loop
  return (
    <div className="notice-ticker" role="region" aria-label="Latest notices">
      <div className="track">
        {items.map((n, i) => (
          <span key={i}>
            <strong>{n.tag}:</strong> {n.title}
          </span>
        ))}
      </div>
    </div>
  );
}
