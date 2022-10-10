# https://code-maven.com/create-images-with-python-pil-pillow
# https://stackoverflow.com/questions/1970807/center-middle-align-text-with-pil
from PIL import Image, ImageDraw, ImageFont
 
W, H = (1200,630)
img = Image.new('RGB', (W, H), color = (0, 0, 0))
 
msg = "How to Unit Test Using\nJasmine and TypeScript"
font = ImageFont.truetype('Silkscreen-Regular.ttf', 72)
d = ImageDraw.Draw(img)
_, _, w, h = d.textbbox((0, 0), msg, font=font)
d.text(((W-w)/2,(H-h)/2), msg, font=font, fill=(255, 255, 255))
 
img.save('pil_text_font.png')