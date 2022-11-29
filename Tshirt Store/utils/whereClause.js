// base = Product.find()
//bigQ - serach=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199


class WhereClause{
    constructor(base,bigQ){
        this.base = base
        this.bigQ = bigQ
    }
    search(){
        const searchWord = this.bigQ.search?{
            name:{
                $regex:this.bigQ.serach,
                $options:"i"  //for case insensitivity
            }
        }:{}
        this.base = this.base.find({...searchWord})
        return this
    }
    filter(){
        const copyQ = {...this.bigQ}

        delete copyQ["search"]
        delete copyQ["limit"]
        delete copyQ["page"]

        // convert bigQ into a string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ)
        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`)

        //again converting it into json
        let jsonCopyOfCopyQ = JSON.parse(stringOfCopyQ)
        this.base = this.base.find(jsonCopyOfCopyQ)
        return this
    }
    pager(resultperPage){
        let currentPage = 1
        if(this.bigQ.page){
            currentPage = this.bigQ.page
        }
        const skipVal = resultperPage * (currentPage-1)
        this.base = this.base.limit(resultperPage).skip(skipVal)
        return this
    }
}


module.exports = WhereClause