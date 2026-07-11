import re

filename = 'sadasyata.html'

with open(filename, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace occupation input
occupation_input = r'<input type="text" id="occupation"[^>]*>'
occupation_select = '''<select id="occupation" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box; background: #fff;">
                                    <option value="" data-en="Select Occupation" data-hi="पेशा चुनें">Select Occupation / पेशा चुनें</option>
                                    <option value="Government Job" data-en="Government Job" data-hi="सरकारी नौकरी">Government Job / सरकारी नौकरी</option>
                                    <option value="Private Job" data-en="Private Job" data-hi="प्राइवेट नौकरी">Private Job / प्राइवेट नौकरी</option>
                                    <option value="Business" data-en="Business" data-hi="व्यापार (Business)">Business / व्यापार</option>
                                    <option value="Self Employed" data-en="Self Employed" data-hi="स्वरोजगार (Self Employed)">Self Employed / स्वरोजगार</option>
                                    <option value="Professional" data-en="Professional" data-hi="पेशेवर (Professional)">Professional / पेशेवर</option>
                                    <option value="Retired" data-en="Retired" data-hi="सेवानिवृत्त (Retired)">Retired / सेवानिवृत्त</option>
                                    <option value="Student" data-en="Student" data-hi="विद्यार्थी (Student)">Student / विद्यार्थी</option>
                                    <option value="Homemaker" data-en="Housewife / Homemaker" data-hi="गृहिणी (Homemaker)">Housewife / गृहिणी</option>
                                    <option value="Other" data-en="Other" data-hi="अन्य (Other)">Other / अन्य</option>
                                </select>'''

# Replace education input
education_input = r'<input type="text" id="education"[^>]*>'
education_select = '''<select id="education" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box; background: #fff;">
                                    <option value="" data-en="Select Education" data-hi="शिक्षा चुनें">Select Education / शिक्षा चुनें</option>
                                    <option value="High School" data-en="High School (10th)" data-hi="हाई स्कूल (10वीं)">High School (10th) / हाई स्कूल (10वीं)</option>
                                    <option value="Intermediate" data-en="Intermediate (12th)" data-hi="इंटरमीडिएट (12वीं)">Intermediate (12th) / इंटरमीडिएट (12वीं)</option>
                                    <option value="Diploma" data-en="Diploma" data-hi="डिप्लोमा">Diploma / डिप्लोमा</option>
                                    <option value="Graduate" data-en="Graduate" data-hi="स्नातक (Graduate)">Graduate / स्नातक</option>
                                    <option value="Post Graduate" data-en="Post Graduate" data-hi="स्नातकोत्तर (Post Graduate)">Post Graduate / स्नातकोत्तर</option>
                                    <option value="Doctorate" data-en="Doctorate" data-hi="डॉक्टरेट (Doctorate)">Doctorate / डॉक्टरेट</option>
                                    <option value="Professional Degree" data-en="Professional Degree" data-hi="व्यावसायिक डिग्री">Professional Degree / व्यावसायिक डिग्री</option>
                                    <option value="Other" data-en="Other" data-hi="अन्य (Other)">Other / अन्य</option>
                                </select>'''

html = re.sub(occupation_input, occupation_select, html)
html = re.sub(education_input, education_select, html)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated sadasyata.html")
