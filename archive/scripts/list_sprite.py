# Inspect the uploaded "SabresRevenge_original.sb3" to list sprites and sounds
import zipfile, json, pandas as pd
from caas_jupyter_tools import display_dataframe_to_user

sb3_path = "/mnt/data/SabresRevenge_original.sb3"

with zipfile.ZipFile(sb3_path, 'r') as z:
    pj = json.loads(z.read("project.json").decode("utf-8"))
    
targets = pj["targets"]
rows = []
sound_rows = []
for t in targets:
    name = t.get("name")
    is_stage = t.get("isStage", False)
    sounds = t.get("sounds", [])
    for s in sounds:
        sound_rows.append({
            "sprite": name,
            "is_stage": is_stage,
            "sound_name": s.get("name"),
            "rate": s.get("rate"),
            "sampleCount": s.get("sampleCount"),
            "format": s.get("format"),
        })
    rows.append({
        "name": name,
        "is_stage": is_stage,
        "costumes": len(t.get("costumes", [])),
        "sounds": len(sounds),
        "blocks": len(t.get("blocks", {})),
        "variables": len(t.get("variables", {})),
        "broadcasts": len(t.get("broadcasts", {}))
    })

sprites_df = pd.DataFrame(rows)
sounds_df = pd.DataFrame(sound_rows)

display_dataframe_to_user("Project Sprites Overview", sprites_df)
display_dataframe_to_user("All Sounds in Project", sounds_df)

[name for name in [t["name"] for t in targets]]
