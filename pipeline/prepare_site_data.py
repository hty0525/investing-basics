"""pipeline/dataset3.json → public/data (클라이언트 시뮬레이터용) + src/data/meta.json (빌드 시 정적 페이지용)."""
import json,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D=json.load(open(f"{root}/pipeline/dataset3.json"))
os.makedirs(f"{root}/public/data/products",exist_ok=True);os.makedirs(f"{root}/src/data",exist_ok=True)
meta={}
for k,p in D["products"].items():
    slug=k.lower()
    json.dump({"key":k,"d":p["d"],"c":p["c"],"div":p["div"]},open(f"{root}/public/data/products/{slug}.json","w"),separators=(",",":"))
    meta[k]={a:b for a,b in p.items() if a not in("d","c","div")}
    meta[k]["slug"]=slug;meta[k]["days"]=len(p["d"]);meta[k]["divCount"]=len(p["div"])
json.dump({"d":D["fx"]["d"],"r":D["fx"]["r"]},open(f"{root}/public/data/fx.json","w"),separators=(",",":"))
fxm={a:b for a,b in D["fx"].items() if a not in("d","r")};fxm["last"]=D["fx"]["d"][-1];fxm["lastRate"]=D["fx"]["r"][-1]
json.dump({"products":meta,"facts":D["facts"],"warnings":D["warnings"],"fx":fxm,"built":D["built"]},open(f"{root}/src/data/meta.json","w"),ensure_ascii=False,separators=(",",":"))
print("ok",len(meta))
