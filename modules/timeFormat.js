function formatTime(date) {
    const now = new Date();
    const d = new Date(date);

    const seconds = Math.floor((now - d) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeAgo = "";

    if (seconds < 60) timeAgo = "Vừa xong";
    else if (minutes < 60) timeAgo = minutes + " phút trước";
    else if (hours < 24) timeAgo = hours + " giờ trước";
    else if (days < 7) timeAgo = days + " ngày trước";
    else timeAgo = d.toLocaleDateString('vi-VN');

    const fullDate = d.toLocaleDateString('vi-VN');

    return `${timeAgo} • ${fullDate}`;
}
module.exports = formatTime;