const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors());
app.use(bodyParser.json());
//MONGODB CONNECTION STRING
mongoose.connect('mongodb+srv://ilakkiyabaskaran1807:utGfVF9ZB10FIBby@cluster0.kg1gzxz.mongodb.net/instack?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
  console.log("mongodb connected")
}).catch((err)=>{
  console.log(err.message);
});
// FORM SCHEMA AND RESPONSE SCHEMA
const formSchema = new mongoose.Schema({}, { 
  strict: false,        
  validateBeforeSave: false, 
  versionKey: false    
});

const responseSchema = new mongoose.Schema({}, {
  strict: false,
  validateBeforeSave: false,
  versionKey: false
});

const Form = mongoose.model('Form', formSchema);
const Response = mongoose.model('Response', responseSchema);
// ENDPOINT TO PUBLISH
app.post('/api/forms', async (req, res) => {
  try {
    const formId = uuidv4();
    
   
    const form = new Form({
      formId,
      ...req.body, 
      createdAt: new Date()
    });
    
    await form.save();
    res.json({ formId });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ 
      error: 'Form saved without validation',
      details: error.message 
    });
  }
});

//TO GET THE FORM
app.get('/api/forms/:formId', async (req, res) => {
  try {
    const form = await Form.findOne({ formId: req.params.formId });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//TO STORE THE RESPONSES
app.post('/api/forms/:formId/responses', async (req, res) => {
  try {
    // Store response exactly as received
    const response = new Response({
      formId: req.params.formId,
      ...req.body,
      submittedAt: new Date()
    });
    
    await response.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//TO LIST OUT ALL RESPONSES
app.get('/api/forms/:formId/responses', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});