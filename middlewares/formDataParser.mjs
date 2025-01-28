function formDataParser(req, _, next) {
    console.log('in form parser ')
    try {
        const parsedBody = JSON.parse(req.body.body)
        req.body = parsedBody || {}
        next()
    } catch (err) { next(err) }
}

export default formDataParser;