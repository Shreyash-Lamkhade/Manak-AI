import json
import random
from datetime import datetime, timedelta
import os

def main():
    out_dir = r'd:\Sem 5\SIH26\BIS-frontend\server\data'
    os.makedirs(out_dir, exist_ok=True)
    
    # Base standards to include
    must_include = [
        ("IS 10322 (Part 5/Sec 4):2018", "Road and Street Lighting Luminaires", "सड़क और स्ट्रीट लाइटिंग ल्यूमिनेयर", "Electrical and Electronics", "Luminaires"),
        ("IS 16102 (Part 1):2012", "Self-Ballasted LED Lamps", "स्व-गिट्टी वाले एलईडी लैंप", "Electrical and Electronics", "Lamps"),
        ("IS 269:2015", "Ordinary Portland Cement", "साधारण पोर्टलैंड सीमेंट", "Construction and Civil Engineering", "Cement"),
        ("IS 1239 (Part 1):2004", "MS ERW Pipes", "एमएस ईआरडब्ल्यू पाइप", "Construction and Civil Engineering", "Pipes"),
        ("IS 4984:2016", "HDPE Pipes", "एचडीपीई पाइप", "Construction and Civil Engineering", "Pipes"),
        ("IS 456:2000", "Plain and Reinforced Concrete", "सादा और प्रबलित कंक्रीट", "Construction and Civil Engineering", "Concrete"),
        ("IS 2112:2000", "Automotive Seat Belts", "ऑटोमोटिव सीट बेल्ट", "Automotive Components", "Safety Systems"),
        ("IS 2189:2008", "Fire Detection Systems", "अग्नि पहचान प्रणाली", "Electrical and Electronics", "Fire Safety"),
        ("IS 16289:2014", "Surgical Masks", "सर्जिकल मास्क", "Textiles", "Medical Textiles"),
        ("IS 10500:2012", "Drinking Water", "पीने का पानी", "Food Safety", "Water"),
        ("IS 15105:2002", "Fire Safety Sprinklers", "अग्नि सुरक्षा स्प्रिंकलर", "Electrical and Electronics", "Fire Safety"),
        ("IS 1944 (Part 1):1990", "Lighting of Public Thoroughfares", "सार्वजनिक मार्गों की प्रकाश व्यवस्था", "Electrical and Electronics", "Lighting"),
        ("IS 13021:1991", "Self-Ballasted Lamps Safety", "स्व-गिट्टी लैंप सुरक्षा", "Electrical and Electronics", "Lamps")
    ]
    
    additional_standards = [
        # Construction
        ("IS 1786:2008", "High strength deformed steel bars", "उच्च शक्ति वाले विकृत स्टील बार", "Construction and Civil Engineering", "Steel"),
        ("IS 383:2016", "Coarse and fine aggregate for concrete", None, "Construction and Civil Engineering", "Aggregate"),
        ("IS 1489 (Part 1):2015", "Portland Pozzolana Cement", "पोर्टलैंड पॉज़ोलाना सीमेंट", "Construction and Civil Engineering", "Cement"),
        ("IS 800:2007", "General construction in steel", None, "Construction and Civil Engineering", "Steel"),
        ("IS 1077:1992", "Common burnt clay building bricks", "सामान्य जली हुई मिट्टी की ईंटें", "Construction and Civil Engineering", "Bricks"),
        # Electrical
        ("IS 694:2010", "PVC insulated cables for working voltages up to 1100 V", "1100 वी तक पीवीसी इंसुलेटेड केबल", "Electrical and Electronics", "Cables"),
        ("IS 1554 (Part 1):1988", "PVC insulated (heavy duty) electric cables", None, "Electrical and Electronics", "Cables"),
        ("IS 732:1989", "Code of practice for electrical wiring installations", "विद्युत तारों की स्थापना के लिए अभ्यास संहिता", "Electrical and Electronics", "Wiring"),
        ("IS 3043:1987", "Code of practice for earthing", None, "Electrical and Electronics", "Earthing"),
        ("IS 1445:1977", "Porcelain insulators for overhead power lines", "ओवरहेड पावर लाइनों के लिए चीनी मिट्टी के इन्सुलेटर", "Electrical and Electronics", "Insulators"),
        # Textiles
        ("IS 17482:2020", "Reusable Sanitary Pad", None, "Textiles", "Personal Hygiene"),
        ("IS 11871:1986", "Methods for determination of flammability of textile fabrics", None, "Textiles", "Testing Methods"),
        ("IS 15938:2011", "Geotextiles", "जियोटेक्सटाइल", "Textiles", "Technical Textiles"),
        ("IS 3770:1994", "Cotton yarn", "सूती धागा", "Textiles", "Yarns"),
        ("IS 1544:1973", "Cotton calico", None, "Textiles", "Fabrics"),
        # Food Safety
        ("IS 1166:2022", "Condensed Milk", "संघनित दूध", "Food Safety", "Dairy"),
        ("IS 3959:2004", "Skimmed Milk Powder", None, "Food Safety", "Dairy"),
        ("IS 11536:2007", "Processed Cereal Based Complementary Foods", "संसाधित अनाज आधारित पूरक खाद्य पदार्थ", "Food Safety", "Baby Food"),
        ("IS 1374:2007", "Poultry Feeds", None, "Food Safety", "Animal Feed"),
        ("IS 15495:2004", "Printing Ink for food packaging", None, "Food Safety", "Packaging"),
        # Chemicals
        ("IS 299:2012", "Alum", "फिटकरी", "Chemicals", "Salts"),
        ("IS 323:2009", "Rectified Spirit", None, "Chemicals", "Alcohols"),
        ("IS 101:2021", "Methods of sampling and test for paints", "पेंट के परीक्षण के तरीके", "Chemicals", "Paints"),
        ("IS 266:1993", "Sulphuric acid", None, "Chemicals", "Acids"),
        ("IS 252:2013", "Caustic Soda", "कास्टिक सोडा", "Chemicals", "Alkalis"),
        # Automotive
        ("IS 14220:1994", "Automotive vehicles - Wheel rims", "ऑटोमोटिव वाहन - व्हील रिम्स", "Automotive Components", "Wheels"),
        ("IS 15945:2012", "Automotive vehicles - Safety glazing", None, "Automotive Components", "Glass"),
        ("IS 16010:2012", "Pneumatic tyres for commercial vehicles", "वाणिज्यिक वाहनों के लिए वायवीय टायर", "Automotive Components", "Tyres"),
        ("IS 16515:2017", "Two Wheeler Helmets", "दोपहिया वाहन हेलमेट", "Automotive Components", "Safety Gear"),
        ("IS 2553 (Part 2):2019", "Safety glass for road vehicles", None, "Automotive Components", "Glass"),
        # Household Appliances
        ("IS 302 (Part 1):2008", "Safety of household and similar electrical appliances", "घरेलू और समान विद्युत उपकरणों की सुरक्षा", "Household Appliances", "Safety"),
        ("IS 374:2019", "Electric ceiling type fans", "इलेक्ट्रिक सीलिंग टाइप पंखे", "Household Appliances", "Fans"),
        ("IS 4150:1993", "Tape recorders", None, "Household Appliances", "Electronics"),
        ("IS 4250:1980", "Domestic electric food mixers", "घरेलू बिजली के फूड मिक्सर", "Household Appliances", "Kitchen Appliances"),
        ("IS 2347:2017", "Domestic pressure cookers", "घरेलू प्रेशर कुकर", "Household Appliances", "Kitchen Appliances"),
        # Packaging
        ("IS 2771 (Part 1):1990", "Corrugated fibreboard boxes", "नालीदार फाइबरबोर्ड बक्से", "Packaging", "Boxes"),
        ("IS 10106 (Part 1/Sec 1):1990", "Packaging code", None, "Packaging", "Code"),
        ("IS 7019:1998", "Glossary of terms in packaging", None, "Packaging", "Glossary"),
        ("IS 15410:2003", "Containers for packaging of natural mineral water", "पानी की पैकेजिंग के लिए कंटेनर", "Packaging", "Plastic Containers"),
        ("IS 7138:1993", "Steel drums", None, "Packaging", "Drums")
    ]
    
    all_standards_data = must_include + additional_standards
    
    # Fill up to 52 to ensure we have >50
    categories_available = ["Construction and Civil Engineering", "Electrical and Electronics", "Textiles", "Food Safety", "Chemicals", "Automotive Components", "Household Appliances", "Packaging"]
    
    extra_count = 52 - len(all_standards_data)
    for i in range(extra_count):
        cat = random.choice(categories_available)
        all_standards_data.append((f"IS {10000+i}:2020", f"Sample Standard {i} for {cat}", None, cat, "General"))

    all_is_numbers = [item[0] for item in all_standards_data]
    
    standards_json = []
    
    for item in all_standards_data:
        is_num = item[0]
        title = item[1]
        hindi = item[2]
        cat = item[3]
        sub = item[4]
        
        # Spec based on category
        spec = {}
        if cat == "Electrical and Electronics":
            spec = {"wattage": "100W", "voltage": "240V", "ip_rating": "IP65", "frequency": "50Hz", "power_factor": "0.95", "lumen_output": "10000 lm"}
        elif cat == "Construction and Civil Engineering":
            spec = {"compressive_strength": "53 MPa", "tensile_strength": "400 MPa", "water_absorption": "5%", "grade": "M30", "density": "2400 kg/m³"}
        elif cat == "Textiles":
            spec = {"gsm": "150", "thread_count": "200", "tensile_strength": "300 N", "tear_strength": "15 N", "color_fastness": "4.5"}
        elif cat == "Food Safety":
            spec = {"moisture_content": "5%", "acidity": "0.1%", "protein_content": "12%", "fat_content": "3%", "shelf_life": "12 months"}
        elif cat == "Chemicals":
            spec = {"purity": "99.5%", "ph_range": "6.5-7.5", "viscosity": "50 cP", "flash_point": "100°C", "density": "1.2 g/cm³"}
        elif cat == "Automotive Components":
            spec = {"tensile_strength": "500 MPa", "hardness": "60 HRC", "impact_resistance": "50 J", "temperature_range": "-40°C to 120°C"}
        elif cat == "Household Appliances":
            spec = {"wattage": "1200W", "voltage": "230V", "energy_rating": "5 Star", "noise_level": "45 dB", "capacity": "1.5L"}
        elif cat == "Packaging":
            spec = {"gsm": "200", "burst_strength": "350 kPa", "moisture_resistance": "High", "compression_strength": "500 N"}
            
        # Select 1-3 random references
        refs = random.sample(all_is_numbers, k=random.randint(1, 3))
        if is_num in refs:
            refs.remove(is_num)
            
        kw_list = title.lower().split() + ["quality", "standard", "india", "bis", "certification", "compliance", "specification", "testing", "requirements"]
        # Remove common short words
        kw_list = [kw for kw in kw_list if len(kw) > 2]
        kw_list = list(set(kw_list))[:10]
        if len(kw_list) < 8:
            kw_list += ["safety", "manufacturing", "product"]
        
        entry = {
            "is_number": is_num,
            "title": title + " — Specification",
            "title_hindi": hindi,
            "category": cat,
            "sub_category": sub,
            "scope": f"This standard prescribes the requirements for {title}. It covers the manufacturing, testing, and quality control processes. Designed to ensure product safety and reliability in {cat}.",
            "keywords": kw_list[:12],
            "specifications": spec,
            "normative_references": refs,
            "is_qco_mandatory": random.choice([True, False, True]), # Bias towards true
            "qco_enforcement_date": "2026-10-01" if random.choice([True, False]) else "2026-08-15",
            "version": "1st Revision, 2020",
            "last_amended": "2024-05-10",
            "amendment_history": [
                { "amendment_number": "Amd 1", "date": "2024-05-10", "description": "Updated minor specifications and testing procedures" }
            ],
            "international_equivalent": f"ISO {random.randint(1000, 9999)}:2015",
            "search_weight_boost": 1.2 if "10322" in is_num or "269" in is_num else 1.0
        }
        standards_json.append(entry)
        
    with open(os.path.join(out_dir, 'standards.json'), 'w', encoding='utf-8') as f:
        json.dump(standards_json, f, indent=2, ensure_ascii=False)

    # QCO Products
    qco_products = []
    for i, std in enumerate(all_standards_data[:35]):
        is_num = std[0]
        title = std[1]
        cat = std[3]
        qco = random.choice([True, False, True])
        
        qco_products.append({
            "product_name": title,
            "product_category": cat,
            "is_qco_mandatory": qco,
            "applicable_is_number": is_num,
            "enforcement_date": "2026-11-01" if qco else None,
            "aliases": [f"{title.lower()} item", f"standard {title.split()[0].lower()}", f"quality {title.split()[-1].lower()}", f"bis {title.lower()}"]
        })
    with open(os.path.join(out_dir, 'qco_products.json'), 'w', encoding='utf-8') as f:
        json.dump(qco_products, f, indent=2, ensure_ascii=False)

    # History
    history = []
    depts = ["Ministry of Commerce & Industry", "Ministry of Power", "Ministry of Consumer Affairs", "Ministry of Textiles", "Ministry of Jal Shakti"]
    
    base_time = datetime(2026, 8, 20, 10, 0)
    for i in range(15):
        hist_time = base_time + timedelta(days=i%10, hours=random.randint(1,10), minutes=random.randint(0,59))
        history.append({
            "id": i+1,
            "query": f"LED street light {i}W IP65" if i%3==0 else f"Standard cement grade {i}",
            "timestamp": hist_time.isoformat(),
            "top_result_is_number": random.choice(all_is_numbers),
            "department": random.choice(depts),
            "result_count": random.randint(1, 10)
        })
    with open(os.path.join(out_dir, 'history.json'), 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

    # Saved
    saved = [
        {
          "is_number": "IS 10322 (Part 5/Sec 4):2018",
          "title": "Luminaires — Road and Street Lighting",
          "category": "Electrical and Electronics",
          "saved_date": "2026-08-29",
          "is_qco_mandatory": True
        },
        {
          "is_number": "IS 269:2015",
          "title": "Ordinary Portland Cement — Specification",
          "category": "Construction and Civil Engineering",
          "saved_date": "2026-08-28",
          "is_qco_mandatory": True
        },
        {
          "is_number": "IS 16289:2014",
          "title": "Surgical Masks — Specification",
          "category": "Textiles",
          "saved_date": "2026-08-27",
          "is_qco_mandatory": False
        },
        {
          "is_number": "IS 1239 (Part 1):2004",
          "title": "MS ERW Pipes — Specification",
          "category": "Construction and Civil Engineering",
          "saved_date": "2026-08-25",
          "is_qco_mandatory": True
        }
    ]
    with open(os.path.join(out_dir, 'saved.json'), 'w', encoding='utf-8') as f:
        json.dump(saved, f, indent=2, ensure_ascii=False)

    # Departments
    departments = [
        {"id": 1, "name": "Ministry of Commerce & Industry", "officer_name": "Rajesh Kumar", "designation": "Senior Procurement Officer"},
        {"id": 2, "name": "Ministry of Power", "officer_name": "Amit Sharma", "designation": "Director of Standards"},
        {"id": 3, "name": "Ministry of Consumer Affairs", "officer_name": "Priya Singh", "designation": "Quality Controller"},
        {"id": 4, "name": "Ministry of Textiles", "officer_name": "Anil Gupta", "designation": "Technical Advisor"},
        {"id": 5, "name": "Ministry of Jal Shakti", "officer_name": "Sunita Verma", "designation": "Chief Engineer"}
    ]
    with open(os.path.join(out_dir, 'departments.json'), 'w', encoding='utf-8') as f:
        json.dump(departments, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main()
