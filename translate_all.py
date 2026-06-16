import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Dictionary of translations
translations = {
    # Ticker
    'सूचना पट्ट: वार्षिक आम सभा की तिथि शीघ्र घोषित होगी': 'Notice Board: Date for Annual General Meeting will be announced soon',
    'नए सदस्यों का स्वागत है': 'New members are welcome',
    
    # Index
    '"समाज सेवा | एकता | समृद्धि"': '"Service | Unity | Prosperity"',
    'हमसे जुड़ें (Join Us)': 'Join Us',
    'सदस्य देखें (View Members)': 'View Members',
    
    # Contact
    'पूछताछ करें (Enquiry Form)': 'Enquiry Form',
    'संदेश (Message)': 'Message',
    'ईमेल (Email)': 'Email',
    'कार्यालय (Office Address)': 'Office Address',
    'संपर्क करें': 'Contact Us',
    'पूरा नाम (Full Name)': 'Full Name',
    'फ़ोन नंबर (Phone Number)': 'Phone Number',
    'भेजें (Send Message)': 'Send Message',
    
    # Activities
    'अग्रसेन जयंती महोत्सव': 'Agrasen Jayanti Mahotsav',
    'युवक-युवती परिचय सम्मेलन': 'Youth Introduction Meet',
    'विशाल चिकित्सा एवं रक्तदान शिविर': 'Mega Medical & Blood Donation Camp',
    'महाराजा अग्रसेन जी की जयंती के पावन अवसर पर विभिन्न सांस्कृतिक कार्यक्रम, खेलकूद प्रतियोगिताएं और शोभा यात्रा का भव्य आयोजन।': 'Grand organization of various cultural programs, sports competitions, and processions on the auspicious occasion of Maharaja Agrasen Ji\'s birth anniversary.',
    'समाज के विवाह योग्य युवक-युवतियों के लिए एक सुलभ और पारदर्शी मंच, जहाँ परिवार एक दूसरे से मिल सकते हैं।': 'An accessible and transparent platform for marriageable youth of the society, where families can meet each other.',
    'समाज और आमजन के स्वास्थ्य लाभ के लिए निःशुल्क चिकित्सा जांच और स्वैच्छिक रक्तदान शिविरों का नियमित आयोजन।': 'Regular organization of free medical checkups and voluntary blood donation camps for the health benefit of the society and the general public.',
    
    # About
    'महाराजा अग्रसेन जी एक महान शासक और समाजवाद के सच्चे प्रणेता थे, जिन्होंने उत्तर भारत में अग्रोहा नामक एक अत्यंत समृद्ध राज्य की स्थापना की। उनका शासन समानता, अहिंसा और लोकतांत्रिक मूल्यों पर आधारित था।': 'Maharaja Agrasen Ji was a great ruler and a true pioneer of socialism, who established a highly prosperous kingdom named Agroha in North India. His rule was based on equality, non-violence, and democratic values.',
    'यह दुनिया के इतिहास में सहकारी समाजवाद (Cooperative Socialism) का सबसे उत्कृष्ट उदाहरण था, जहाँ किसी को दान मांगने की आवश्यकता नहीं थी, बल्कि समाज परस्पर सहयोग से एक-दूसरे का उत्थान करता था। इसी महान परंपरा के कारण अग्रोहा में कोई भी व्यक्ति न तो गरीब था और न ही बेरोजगार।': 'This was the most outstanding example of Cooperative Socialism in world history, where no one needed to ask for charity; instead, the society uplifted each other through mutual cooperation. Because of this great tradition, no one in Agroha was poor or unemployed.',
    'आज भी अग्रवाल समाज उनके इन्हीं महान सिद्धांतों - अहिंसा, परोपकार, व्यापारिक ईमानदारी और सर्वकल्याण - का पालन करता है और पूरे विश्व में अपनी सामाजिक सेवा के लिए जाना जाता है।': 'Even today, the Agrawal community follows his great principles - non-violence, philanthropy, business honesty, and universal welfare - and is known worldwide for its social service.',
    'स्थापना:': 'Established:',
    'सामाजिक सेवा': 'Social Service',
    'सदस्य सहयोग': 'Member Support',
    '\'एक ईंट और एक रुपया\'': "'One Brick and One Rupee'",
    'समाज के सभी वर्गों की सेवा एवं उत्थान।': 'Service and upliftment of all sections of the society.',
    'एकजुट, समृद्ध और सुसंस्कृत अग्रवाल समाज।': 'A united, prosperous, and cultured Agrawal community.',
    
    # Gallery & General
    'चित्र 1': 'Image 1',
    'चित्र 2': 'Image 2',
    'चित्र 3': 'Image 3',
    'चित्र 4': 'Image 4',
    'चित्र 5': 'Image 5',
    'चित्र 6': 'Image 6',
    'सांस्कृतिक संध्या': 'Cultural Evening',
    'चिकित्सा शिविर': 'Medical Camp',
    'वृक्षारोपण': 'Tree Plantation',
    'सामाजिक कार्यक्रम': 'Social Event',
    'बैठक': 'Meeting',
    'सम्मान समारोह': 'Felicitation Ceremony',
    'अग्रसेन जयंती': 'Agrasen Jayanti',
    'रक्तदान शिविर': 'Blood Donation Camp',
    'परिचय सम्मेलन': 'Introduction Meet',
    
    # Footer
    'Designed with ❤️ for समाज सेवा': 'Designed with ❤️ for Social Service'
}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    for hi_text, en_text in translations.items():
        # Avoid replacing already wrapped strings
        if f'class="lang-hi">{hi_text}</span>' in content or f'class="lang-hi">{hi_text}</' in content:
            continue
            
        replacement = f'<span class="lang-hi">{hi_text}</span><span class="lang-en">{en_text}</span>'
        content = content.replace(hi_text, replacement)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Content translated successfully.")
