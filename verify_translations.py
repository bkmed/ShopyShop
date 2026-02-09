import json
import os

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def flatten_keys(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_keys(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def verify_translations():
    locales_dir = 'src/i18n/locales'
    en_path = os.path.join(locales_dir, 'en.json')
    
    if not os.path.exists(en_path):
        print("Error: en.json not found")
        return

    try:
        en_data = load_json(en_path)
        en_keys = set(flatten_keys(en_data).keys())
    except Exception as e:
        print(f"Error loading en.json: {e}")
        return

    report = {}

    for filename in os.listdir(locales_dir):
        if filename == 'en.json' or not filename.endswith('.json'):
            continue
        
        filepath = os.path.join(locales_dir, filename)
        try:
            data = load_json(filepath)
            keys = set(flatten_keys(data).keys())
            
            missing_in_locale = en_keys - keys
            missing_in_en = keys - en_keys
            
            if missing_in_locale or missing_in_en:
                report[filename] = {
                    'missing_keys': list(missing_in_locale),
                    'extra_keys': list(missing_in_en)
                }
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    verify_translations()
