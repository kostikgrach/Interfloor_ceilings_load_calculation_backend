import { Controller, Get, Post, Param, Query, Render, Body } from '@nestjs/common';

export interface Load {
  id: number,
  title: string,
  description: string,
  standart_load: number,
  reliability_coefficient: number,
  image: string,
  video: string,
  status: string,
  likes: number[],
}

@Controller('load-calculation')
export class LoadsCalculationController {
  private loads = [
    {
      id: 1,
      title: 'Полезная нагрузка (Жилые здания)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 150,
      reliability_coefficient: 1.3,
      status: 'active',
      likes: [1, 2],
      image: '1.webp',
      video: '1.mp4',
    },
    {
      id: 2,
      title: 'Полезная нагрузка (Кабинеты офисов)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 200,
      reliability_coefficient: 1.2,
      status: 'active',
      likes: [],
      image: '2.webp',
      video: '2.mp4',
    },
    {
      id: 3,
      title: 'Полезная нагрузка (Гостиничные номера)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 200,
      reliability_coefficient: 1.2,
      status: 'active',
      likes: [3],
      image: '3.webp',
      video: '3.mp4',
    },
    {
      id: 4,
      title: 'Межэтажное перекрытие (Плиты)',
      description: 'Межэтажное перекрытие — это горизонтальная несущая конструкция, которая разделяет смежные этажи здания.',
      standart_load: 300,
      reliability_coefficient: 1.1,
      status: 'active',
      likes: [],
      image: '4.webp',
      video: '4.mp4',
    },
    {
      id: 5,
      title: 'Межэтажное перекрытие (Железобетон)',
      description: 'Межэтажное перекрытие — это горизонтальная несущая конструкция, которая разделяет смежные этажи здания.',
      standart_load: 300,
      reliability_coefficient: 1.1,
      status: 'draft',
      likes: [],
      image: '',
      video: '',
    },
    {
      id: 6,
      title: 'Полезная нагрузка (Интерьер)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 100,
      reliability_coefficient: 1.0,
      status: 'deleted',
      likes: [],
      image: '1.webp',
      video: '1.mp4',
    },
    {
      id: 7,
      title: 'Полезная нагрузка (Спортивные залы)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 400,
      reliability_coefficient: 1.2,
      status: 'active',
      likes: [1234567, 764321, 1],
      image: '7.webp',
      video: 'sport.mp4',
    },
    {
      id: 8,
      title: 'Полезная нагрузка (Архивы, книгохранилища, библиотечные хранилища)',
      description: 'Полезная нагрузка — это временная нагрузка, обусловленная назначением здания и возникающая в процессе его эксплуатации.',
      standart_load: 500,
      reliability_coefficient: 1.2,
      status: 'active',
      likes: [],
      image: 'library.webp',
      video: '8.mp4',
    },
  ]
  
  @Get()
  @Render('main')
  getLoads() {
    return {
      title: 'Load List',
      data: {
        current_date: new Date().toLocaleDateString(),
        loads: this.loads,
        first_id: this.loads.find(load => load.status === 'active')?.id ?? null,
        active: 0,
      },
    };
  }

  @Post()
  @Render('main')
  async searchOrders(@Body() body: { minimum?: string, maximum?: string }) {
    const minimum = body?.minimum || '0';
    const maximum = body?.maximum || '500';
    let loads: Load[];
    
    // Если запрос не пустой, выполняем поиск по названию заказа
    if (minimum && minimum.trim()) {
      // Фильтруем заказы по названию (регистронезависимый поиск)
      loads = this.loads.filter(load => 
        load.standart_load >= Number(minimum) && load.standart_load <= Number(maximum)
      );
    } else {
      loads = this.loads;
    }

    return {
      title: 'Список заказов',
      name: 'BMSTU',
      data: {
        current_date: new Date().toLocaleDateString(),
        loads: loads,
        first_id: this.loads.find(load => load.status === 'active')?.id ?? null,
        active: 0,
        minimum: minimum,
        maximum: maximum,
      },
    };
  }

  @Get('load/:id')
  @Render('load')
  getLoad(@Param('id') id: string, @Query() query: {next?: string}) {
    const load_index = this.loads.findIndex(o => o.id === Number(id));
    if (load_index === -1) {
      return {
        title: 'Не найдено',
        data: {
          id,
          current_date: new Date().toLocaleDateString(),
          load: null,
          active: 2
        },
      };
    }
    const load = (query.next === 'true')
                ? this.loads.slice(load_index + 1).find(o => o.status === 'active') 
                : this.loads.find(o => o.id === Number(id) && o.status === 'active')

    return {
      title: load ? load.title : 'Не найдено',
      data: {
        id: load?.id,
        current_date: new Date().toLocaleDateString(),
        load: load,
        first_id: this.loads.find(load => load.status === 'active')?.id ?? null,
        active: 2
      },
    };
  }

  @Get('/add')
  @Render('add')
  addLoad() {
    const load_draft = this.loads.find(o => o.status === 'draft');
    return {
      title: 'Добавить',
      image: (load_draft?.image === '')? 'Файл не выбран' : load_draft?.image,
      video: (load_draft?.video === '')? 'Файл не выбран' : load_draft?.video,
      data: {
        load: load_draft,
        first_id: this.loads.find(load => load.status === 'active')?.id ?? null,
        active: 1,
      }
    }
  }
}
