function formatTime(date) {
    const now = new Date();
    const d = new Date(date);

    const seconds = Math.floor((now - d) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let timeAgo = "";

    if (seconds < 60) timeAgo = "Vừa xong";
    else if (minutes < 60) timeAgo = minutes + " phút trước";
    else if (hours < 24) timeAgo = hours + " giờ trước";
    else if (days < 7) timeAgo = days + " ngày trước";
    else if (weeks < 4) timeAgo = weeks + " tuần trước";
    else if (months < 12) timeAgo = months + " tháng trước";
    else timeAgo = years + " năm trước";

    const fullDate = d.toLocaleDateString('vi-VN');

    return `${timeAgo} • ${fullDate}`;
}
module.exports = formatTime;