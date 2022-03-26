const greeting = (req, res) => {
    res.status(200).json({
        msg: "Maaf Sesi Anda Sudah Habis",
    })
}

module.exports = {
    greeting,
}