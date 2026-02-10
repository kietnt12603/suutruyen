export function generateSlug(text: string): string {
    const from = "àáäâèéëêìíïîòóöôùúüûñçđỳýỵỷỹàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ"
    const to = "aaaaeeeeiiiioooouuuuncdyyyyyaaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyy"

    let slug = text.toLowerCase();

    for (let i = 0, l = from.length; i < l; i++) {
        slug = slug.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    return slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
