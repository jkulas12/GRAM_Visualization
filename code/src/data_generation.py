# Joshua Kulas
# 11/8/16
# Script to create data file for visualization

import pickle
import json


########################################
#           Input Files                #
########################################

data_directory = '../../data/'

# ancestorMap: 2D list of ancestors of a code, ordered from root first to leave(code) last
ancestorMap = pickle.load(open(data_directory + 'ancestorMap.p', 'rb'))

# attentions: 2D list of attentions of ancestors, ordered from root first to leave(code) last
attentions = pickle.load(open(data_directory + 'attentions.p', 'rb'))

# strToIndexMap: mapping from code string representation to index used in ancestorMap and attentions
strToIndexMap = pickle.load(open(data_directory + 'str2intMap.p', 'rb'))

# tsne: json file with tSNE coordinates
tsne = json.load(open(data_directory + 'tsne.json', 'rb'))

# map of code to code information
# data format:
#   code : {code_description : a_code_string,
#       ancestors[{code : a_code_string, attention : .12},...,],
#       tsne_x : 1.2,
#       tsne_y : 2.3}
codeMap = {}
indexToStringMap = {}

# iterate through strToIndexMap and create reversed_map
for code in strToIndexMap:
    indexToStringMap[strToIndexMap[code]] = code
print(strToIndexMap)
print(indexToStringMap)



# iterate through ancestors and create codeMap that will be exported
for i in range(len(ancestorMap)):
    code = indexToStringMap[i]
    codeMap[code] = {'code' : code}
    codeMap[code]['ancestors'] = [{'code' : indexToStringMap[ancestorMap[i][x]], 'attention' : float(attentions[i][x])} for x in range(len(ancestorMap[i]))]

# parse codes and coordinates from tsne
for item in tsne:
    code = item['name'].split(':')[0]
    codeMap[code]['tsne_x'] = item['data'][0][0]
    codeMap[code]['tsne_y'] = item['data'][0][1]
    codeMap[code]['code_description'] = item['name'].split(':')[1]
    codeMap[code]['fill_color'] = item['marker']['fillColor']

# export data
json.dump(codeMap, open(data_directory + 'codeMap.json','w'))