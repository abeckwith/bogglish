f = open("dictionary.txt", "r")
words = f.read()
f.close()
word_list = words.split("\n")
word_list.sort()
new_text = "var all_words_178k = ["
previous_word = ""
# word_list = words.split()
# word_list.sort()

for w in word_list:
    # if len(w) < 14:

    # if len(w) > 10:
    #     print(len(w))
    # not w.isupper() and w.lower() and != previous_word.lower()
    if len(w) > 1 and w.find("'") == -1 and w.find("-") == -1:
        # if len(w) < 5:
        new_text += '"' + w.lower() + '",\n'
        # new_text += w + '\n'
        previous_word = w
    # if len(w) < 5:
    #     print(w)
new_text += "]"
f = open("all_words_178k.js", "w")  # "word_data.js", "w")
f.write(new_text)
f.close()
