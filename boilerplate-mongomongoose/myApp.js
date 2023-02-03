require('dotenv').config();
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let personSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  age: Number, 
  gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Nonbinary'] }, 
  isMarried: Boolean, 
  isParent: Boolean, 
  favoriteFoods: [String]
});

let Person = mongoose.model('Person', personSchema);

const createAndSavePerson = (done) => {
  let newPerson = new Person({name: 'Hakos Baelz', age: 12, gender: 'Female', isMarried: true, isParent: false, favoriteFoods: ['Not Chocolate']});
  newPerson.save().then(data => done(null, data)).catch(error => done(error));
};

const createManyPeople = (arrayOfPeople, done) => {
  for (let i in arrayOfPeople) {
    Person.create(arrayOfPeople[i]).then(data => done(null, data)).catch(error => done(error));
  };
};

const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }).then(results => done(null, results)).catch(error => done(error));
};

const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }).then(result => done(null, result)).catch(error => done(error));
};

const findPersonById = (personId, done) => {
  Person.findById({ _id: personId }).then(result => done(null, result)).catch(error => done(error));
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findById({ _id: personId }).then((result) => {
    result.favoriteFoods.push(foodToAdd);
    result.save().then(data => done(null, data)).catch(err => done(err));
  }).catch(error => done(error));
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}).then(result => done(null, result)).catch(error => done(error));
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId).then(result => done(null, result)).catch(err => done(err));
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name: nameToRemove}).then(result => done(null, result)).catch(err => done(err));
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  const stdCallBack = (err, data) => {
    if (err) {
      return done(err);
    } 
    done(null, data);
  };
  Person.find({favoriteFoods: foodToSearch})
    .sort('name')
    .limit(2)
    .select('-age')
    .exec(stdCallBack);
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
